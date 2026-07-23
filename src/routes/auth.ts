import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import { notFound } from '../middlewares.js'
import jwt from 'jsonwebtoken'
import { userCreate, userGet } from '../db.js'
import type { DTOUser } from '../dto.js'

export const jwtkey = "chavealeatoriaabalabala"
const router = express.Router()

async function userFindOrCreate(name: string, email: string): Promise<DTOUser | null>{
  let user;
  try{
    do{
      user = await userGet(email)
      console.log("get user", user)
      if (user){
        console.log("achou user")
        return user
      }
      userCreate({name: name, email: email})
      console.log("criou user")
    } while(!user);   
  } catch (e){
    return null
  }
  return null
}
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
router.post("/google", async (req, res) => {
  const token = req.body.token

  if (!token){
    return res.status(400).json({error: "token não fornecido"})
  }
  if (!process.env.GOOGLE_CLIENT_ID){
    return res.status(500).json({error: "somos burros e .env não tem google_client_id"})
  }
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload();
  if (!payload) {
    return res.status(401).json({ error: "token inválido" })
  }
  const { sub: googleId, email, name, picture } = payload
  if (!email){
    throw new Error("email undefined")
  }
  if (!name){
    throw new Error("name undefined")
  }
  const user = await userFindOrCreate(name, email)
  if (!user){
    return notFound("user not found") 
  }
  console.log("auth user", user)
  const tokenSession = jwt.sign(user,  jwtkey)
  return res.json({
    user: { googleId, email, name, picture },
    token: tokenSession
  })
})


export default router
import type { PostgrestError } from "@supabase/supabase-js";
import type { NextFunction, Request, Response, ErrorRequestHandler, RequestHandler} from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken'

import type { DTOUser } from "./dto.js";
import { jwtkey } from "./routes/auth.js";
// ??? magica pro typescript aceitar modificar req
declare global {
  namespace Express{
    interface Request{
      user: DTOUser,
      isGuest: boolean,

    }
  }
  interface Error{
    status: number,
  }
}

export const notFound = (msg: string) => {
  const err = new Error(msg)
  err.status = 404
  throw err
}

export const errorPostgres = (err: PostgrestError) =>{
  const error = new Error(err.message)
  error.status = 500
  throw error
}

export const handlerUser: RequestHandler = (req, res, next) => {

  const auth = req.headers.authorization
  if (auth === undefined){
    return res.status(401).json({error: "token de usuário não informado"})
  }
  console.log("auth", auth)
  const [,token] = auth.split(" ")
  if (!token){
    throw new Error("token não fornecido")
  }
  req.isGuest = true
  const verify = jwt.verify(token, jwtkey, (err, decoded) => {
    if (err){
      return res.status(401).json({})
    }
    req.isGuest = false
    console.log("not guest")
    req.user = decoded as DTOUser
  })
  console.log("verify", verify)
  // TODO: validar token
  next()
}

export const handlerLogged: RequestHandler = (req, res, next) => {
  if (req.isGuest) return res.status(401).json({error: "user is guest"})
  
  next()
}


export const handlerError: ErrorRequestHandler = (error: Error, req, res, next) => {
  
  console.log("Error", error)

  res.status(error.status).json({error: error.message, stack: error.stack})
}


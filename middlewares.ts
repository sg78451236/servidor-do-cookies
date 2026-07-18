import type { PostgrestError } from "@supabase/supabase-js";
import type { NextFunction, Request, Response, ErrorRequestHandler, RequestHandler} from "express";
import jwt from 'jsonwebtoken'
import { jwtkey } from "./index.js";
// ??? magica pro typescript aceitar modificar req
declare global {
  namespace Express{
    interface Request{
      user: {
        isGuest: boolean,
        id: string,
      }
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
  const verify = jwt.verify(token, jwtkey)
  console.log("verify", verify)
  // TODO: validar token
  req.user = {isGuest: true, id: ""}
  next()
}

export const handlerLogged: RequestHandler = (req, res, next) => {
  if (req.user.isGuest) return res.status(401).json({error: "user is guest"})
  
  next()
}


export const handlerError: ErrorRequestHandler = (error: Error, req, res, next) => {
  
  console.log("Error", error)

  res.status(error.status).json({error: error.message, stack: error.stack})
}


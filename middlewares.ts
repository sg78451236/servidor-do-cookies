import type { PostgrestError } from "@supabase/supabase-js";
import type { NextFunction, Request, Response, ErrorRequestHandler, RequestHandler} from "express";

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
  const [,token] = auth.split(" ")
  // TODO: validar token
  req.user = {isGuest: true, id: ""}
  next()
}


export const handlerError: ErrorRequestHandler = (error: Error, req, res, next) => {
  
  console.log("Error", error)

  res.status(error.status).json({error: error.message, stack: error.stack})
}


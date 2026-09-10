
import { type Request, type Response} from 'express'
import { commentCreate, commentGet } from '../db_reqs.js'
import type { DTOComment } from '../dto.js'
import { handlerLogged, handlerUser } from '../middlewares.js'

export async function getCommentsByProduct(req: Request, res: Response){
  const { id } = req.params
  if (!id) return res.status(400).json({error: "id do produto não foi determinado"});
  console.log('comments id product', id)
  let comments = await commentGet(id as string)
  // TODO: set usernames

  res.json({comments: comments})
}
export async function postCommentByProduct(req: Request, res: Response){
  let { idProduct } = req.params
  if(Array.isArray(idProduct)){idProduct = idProduct[0]}
  if (!idProduct){return}

  const { comment }: {comment: DTOComment}  = req.body
  comment.userId = req.user.email
  comment.idProduct = idProduct
  console.log(req.isGuest, req.user, comment)
  await commentCreate((comment as DTOComment))

}


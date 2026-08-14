
import express from 'express'
import { commentCreate, commentGet } from '../db_reqs.js'
import type { DTOComment } from '../dto.js'
import { handlerLogged, handlerUser } from '../middlewares.js'
const router = express.Router()


router.get('/:idProduct', async (req, res) => {
  const { idProduct } = req.params
  console.log('comments id product', idProduct)
  let comments = await commentGet(idProduct)
  // TODO: set usernames

  res.json({comments: comments})
})
interface a{
  idProduct: string
}
router.post('/:idProduct', handlerUser, handlerLogged, async (req, res) => {
  let { idProduct } = req.params
  if(Array.isArray(idProduct)){idProduct = idProduct[0]}
  if (!idProduct){return}

  const { comment }: {comment: DTOComment}  = req.body
  comment.userId = req.user.email
  comment.idProduct = idProduct
  console.log(req.isGuest, req.user, comment)
  await commentCreate((comment as DTOComment))

})

export default router

import express from 'express'
import { commentGet } from '../db_reqs'
const router = express.Router()
router.get('/:idProduct', async (req, res) => {
  const { idProduct }= req.query
  const comments = commentGet(idProduct)
  res.json({comments: comments})
})
export default router
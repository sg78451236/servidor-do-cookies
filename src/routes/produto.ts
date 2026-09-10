import express from 'express'
import multer from 'multer'
import path from 'path'
import { commentGet, createProduto, getProdutoById, getProdutos } from '../db_reqs.js';
const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/uploads/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniquename = `${Date.now()}${ext}`
    cb(null, uniquename)
  }
})
const upload = multer({storage});

router.get('/home', async (req, res) => {
  let produtos = getProdutos()
  res.json({ produtos: produtos })
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  const produto = await getProdutoById(id)
  if (!produto) return res.json({produto: null});

  let comments = await commentGet(id)

  res.json({ produto: produto, comments: comments})

});

router.post('/', upload.single('img'), async (req, res) => {
  const produto = JSON.parse(req.body.product)
  console.log("produto", req.body, produto)

  createProduto({image: req.file ? req.file.filename : null, preco: produto.price, nome: produto.name})
  res.status(200).json({msg: ":)"});
})


export default router

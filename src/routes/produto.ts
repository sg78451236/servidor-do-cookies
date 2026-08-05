import express from 'express'
import multer from 'multer'
import { errorPostgres, notFound } from '../middlewares.js';
import { produtoDbToDTO, supabase } from '../db.js';
import type { DTOProduto } from '../dto.js';
import path from 'path'
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

router.get('/:id', async (req, res) => {
  // id = req.query.id
  const id = req.params.id
  const { data, error } = await supabase.from('Cookies').select().eq('id', id)
  if (error) return errorPostgres(error);
  if (data.length == 0) return res.json({produto: null});
  const produto: DTOProduto = produtoDbToDTO(data[0]) 
  if (!produto){
    return notFound("produto não foi encontrado")
  }
  res.json({ produto: produto })

});

router.post('/', upload.single('img'), async (req, res) => {
  const produto = JSON.parse(req.body.product)
  console.log("produto", req.body, produto)
  
  const {data, error} = await supabase.from('Cookies').insert({
    preco: produto.price, nome: produto.name, image: req.file ? req.file.filename : null
  })
  if (error) return errorPostgres(error)
  console.log("post produto", data)
  res.status(200).json({msg: ":)"});
})


export default router
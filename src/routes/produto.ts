import express from 'express'
import multer from 'multer'
import { errorPostgres, notFound } from '../middlewares.js';
import { supabase } from '../db.js';
import type { DTOComment, DTOProduto } from '../dto.js';
import path from 'path'
import { commentDbtoDTO, produtoDbToDTO, Tables } from '../db_to_dto.js';
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
  const { data, error } = await supabase.from(Tables.cookie).select('*')
  console.log(data, error)
  if (error) return errorPostgres(error);
  const produtos: DTOProduto[] = data.map(v => produtoDbToDTO(v))//Array.from(dbProdutos).map((v) => ({id: v[0], ...v[1]})) 
  res.json({ produtos: produtos })
})

router.get('/:id', async (req, res) => {
  // id = req.query.id
  const id = req.params.id
  const { data, error } = await supabase.from(Tables.cookie).select().eq('id', id)
  if (error) return errorPostgres(error);
  if (!data || !data[0] || data.length == 0) return res.json({produto: null});
  const produto: DTOProduto = produtoDbToDTO(data[0]) 
  if (!produto){
    return notFound("produto não foi encontrado")
  }
  const {data : comment, error : errorComment} = await supabase.from(Tables.comment).select().eq('fk_id', id)
  if (errorComment) return errorPostgres(errorComment);
  const comentariosVAR: DTOComment[] = comment.map(p => commentDbtoDTO(p))

  res.json({ produto: produto, comentariosVAR })

});

router.post('/', upload.single('img'), async (req, res) => {
  const produto = JSON.parse(req.body.product)
  console.log("produto", req.body, produto)
  
  const {data, error} = await supabase.from(Tables.cookie).insert({
    preco: produto.price, nome: produto.name, image: req.file ? req.file.filename : null
  })
  if (error) return errorPostgres(error)
  console.log("post produto", data)
  res.status(200).json({msg: ":)"});
})


export default router

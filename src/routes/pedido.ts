import express from 'express'
import type { DTOPedido, DTOProduto } from '../dto.js'
import { createPedido, getPedidoById, getPedidosByUser } from '../db_reqs.js'
import { Tables } from '../db_to_dto.js'
import { idsToDBRow, queryProductsIdOnly, userHasOrderPending } from '../util.js'



const router = express.Router()

router.get('/:id', async (req, res) => {
  const { productsIdOnly } = req.query
  let { id } = req.params
  console.log("pedido id", id, "id only", productsIdOnly)
  let pedido: DTOPedido<string> | null = null;

  pedido = await getPedidoById(id)
  if (!pedido){
    return res.json({error: "pedido não existe"})
  }
  let pedido_result = queryProductsIdOnly(productsIdOnly == "true", pedido)

  console.log("pedido user", pedido.user, req.user.email)
  if (pedido.user != req.user.email) {
    return res.json({error: "usuário não é dono do pedido"})

  }
  return res.json({pedido: pedido_result})

})
router.get('/', async (req, res) => {
  const { productsIdOnly } = req.query
  console.log("user", req.user)
  let meuspedidos: DTOPedido<string>[] = await getPedidosByUser(req.user.email) 
 
  let meuspedidos_res = await Promise.all(
      meuspedidos.map(async pedido => await queryProductsIdOnly(productsIdOnly == "true", pedido))
    )

  console.log("meus pedidos", meuspedidos_res)
  return res.json({pedidos: meuspedidos_res})
})



router.post('/', async (req, res) => {
  const produtosId: string[] = req.body.produtos

  if (produtosId.length == 0) {
    throw new Error("um pedido precisa ter no mínimo 1 produto")
  }
  // check if user already has an pending order
  if (await userHasOrderPending(req.user.email)){
    return res.status(409).json({error: "user ainda tem ao menos 1 pedido pendente"});
  }
  
  await createPedido(produtosId, req.user.email)
})



export default router

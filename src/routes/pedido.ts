import express from 'express'
import { supabase } from '../db.js'
import { qrcodedynamic } from '../asaas.js'
import { errorPostgres, notFound } from '../middlewares.js'
import type { DTOPedido, DTOProduto } from '../dto.js'
import { createPedido, getPedidoById, getPedidosByUser, getProdutoById } from '../db_reqs.js'
import { produtoDbToDTO, Tables } from '../db_to_dto.js'


const validateProdutos = async (produtosId: string[]): Promise<DTOProduto[]> => {
  let resultProdutos: DTOProduto[] = []

  // verificar se cada produto existe na DB
  for(const v of produtosId){
    const {data, error} = await supabase.from(Tables.cookie).select().eq("id", v)
    if (error) return errorPostgres(error);
    if (!data || !data[0]){
      continue;
    }
    let produto: DTOProduto = produtoDbToDTO(data[0])
    
    resultProdutos.push(produto)

  }
  return resultProdutos

}

const router = express.Router()

router.get('/:id', async (req, res) => {
  const { productsIdOnly } = req.query
  let {id} = req.params
  console.log("pedido id", id, "id only", productsIdOnly)
  let pedido: DTOPedido<string> | null;
  let pedido_result: DTOPedido<string | DTOProduto>;
  try {
    pedido = await getPedidoById(id)
  } catch (e){
    return res.json({error: e})
  }
  if (!pedido){
    return res.json({error: "pedido não existe"})
  }
  pedido_result = pedido;
  if (productsIdOnly){
    pedido_result = await setPedidoProducts(pedido)
  }
  console.log("pedido user", pedido.user, req.user.email)
  if (pedido.user != req.user.email) {
    return res.json({error: "usuário não é dono do pedido"})

  }
  return res.json({pedido: pedido_result})

})
async function setPedidoProducts(pedido: DTOPedido<string>) {
    return {
      ...pedido,
      products: (await Promise.all(
	pedido.products.map(id => getProdutoById(id))
      )).filter(p => p !== null)
    }
}
router.get('/', async (req, res) => {
  const { productsIdOnly } = req.query
  console.log("user", req.user)
  let meuspedidos: DTOPedido<string>[] | DTOPedido<DTOProduto>[] = await getPedidosByUser(req.user.email) 
 
  if (productsIdOnly === "false"){
    meuspedidos = await Promise.all(
      meuspedidos.map(async pedido => setPedidoProducts(pedido))
    )

  }

  console.log("meus pedidos", meuspedidos)
  return res.json({pedidos: meuspedidos})
})


function isOrderPending(order: DTOPedido){
  return order.status == "pending";
}

router.post('/', async (req, res) => {
  const produtosId: string[] = req.body.produtos

  if (produtosId.length == 0) {
    throw new Error("um pedido precisa ter no mínimo 1 produto")
  }
  // check if user already has an pending order
  const orders = await getPedidosByUser(req.user.email);
  console.log("orders", orders);
  let orderPending = orders.find((v) => isOrderPending(v));
  if (orderPending){
    return res.status(409).json({error: "user ainda tem ao menos 1 pedido pendente"});
  }


  
  const produtos: DTOProduto[] = await validateProdutos(produtosId)
  await createPedido(produtos, req.user.email)
})



export default router

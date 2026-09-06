import express from 'express'
import { produtoDbToDTO, supabase } from '../db.js'
import { qrcodedynamic } from '../asaas.js'
import { errorPostgres, notFound } from '../middlewares.js'
import type { DTOPedido, DTOProduto } from '../dto.js'
import { createPedido, getPedidoById, getPedidosByUser, getProdutoById } from '../db_reqs.js'


const validateProdutos = async (produtosId: string[]): Promise<DTOProduto[]> => {
  let resultProdutos: DTOProduto[] = []

  // verificar se cada produto existe na DB
  for(const v of produtosId){
    const {data, error} = await supabase.from('Cookies').select().eq("id", v)
    if (error) return errorPostgres(error);
    if (!data || !data[0]){
      continue;
    }
    let produto: DTOProduto = produtoDbToDTO(data[0])
    
    resultProdutos.push(produto)

  }
  return resultProdutos

}
let _customer: string
(async () => {
  _customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
})()

const router = express.Router()

router.get('/', async (req, res) => {
  const { productsIdOnly } = req.query
  let meuspedidos: DTOPedido<string>[] | DTOPedido<DTOProduto>[] = await getPedidosByUser(req.user.email) 
 
  if (productsIdOnly === "false"){
    meuspedidos = await Promise.all(
      meuspedidos.map(async pedido => {
	console.log("meu pedido", pedido);
	return {
        ...pedido,
        products: (await Promise.all(
          pedido.products.map(id => getProdutoById(id))
        )).filter(p => p !== null)
      }})
    )

  }

  console.log("meus pedidos", meuspedidos)
  return res.json({pedidos: meuspedidos})
})


function isOrderPending(order: DTOPedido){
  return true;
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
    return res.json({error: "user ainda tem ao menos 1 pedido pendente"});
  }


  
  const produtos: DTOProduto[] = await validateProdutos(produtosId)
  await createPedido(produtos, req.user.email)
})

router.patch("/pagar", async (req, res) => {
  // FIXME: acho q é importante verificar se o pedido atual do usuario é iguao ao da database
  
  let pedido = await getPedidoById(req.body.pedido)
  if (!pedido){
    return notFound("pedido não foi encontrado")
  }
  console.log("pedido", pedido)
  console.log("produtos", pedido.products)
  let valortotal = 0
  for(const p of pedido.products){
    let produto = await getProdutoById(p)
    if (!produto) continue;
    valortotal += produto.preco
  }
  let pix = await qrcodedynamic(_customer, pedido.id, valortotal)
  return res.json({ pix })
})


export default router

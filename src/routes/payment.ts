
import express, {type Request, type Response} from 'express'
import { getPedidoById, getProdutoById } from '../db_reqs.js'
import { notFound } from '../middlewares.js'
import { qrcodedynamic } from '../asaas.js'
const router = express.Router()


let _customer: string
(async () => {
  _customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
})()

async function patchPaymentByOrderId(req: Request, res: Response) {
  // FIXME: acho q é importante verificar se o pedido atual do usuario é iguao ao da database
  let { id } = req.params
  if (!id) return res.status(400).json({error: "id do pedido não foi determinado"});
  
  let pedido = await getPedidoById(id as string)
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
}

router.patch("order/:id", patchPaymentByOrderId)


export default router

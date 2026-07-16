import express from 'express'
import cors from 'cors'
import { qrcodedynamic } from './asaas.js';
import type { DTOProduto } from './dto.js';
import { handlerError, handlerUser, notFound } from './middlewares.js';
import { dbPedidos, dbProdutos, getPedidoList} from './db.js';

//import { asaasCreateCustomer, fetchAsaas, qrcodedynamic, qrcodestatic } from './asaas';
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json())
// FIXME: Não ta identificando o pedido certo, só pega o primeiro da lista (não da pra pagar outro pedido alem do primeiro)

let _customer: string
(async () => {
  _customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
})()

function getPedidoCurrent(pessoa: string) {
  let lista = getPedidoList(pessoa)
  if (!lista) {
    return notFound("lista de pedidos não existe")
  }
  return lista[0]
}
const createPedido = (userId: string, produtos: DTOProduto[]) => {
  const pedidolist = getPedidoList(userId)
  if (!pedidolist) {
    throw new Error("lista de pedidos não existe")
  }

  pedidolist.push({ idUser: userId, produtos: produtos })

}
const validateProdutos = (produtosId: string[]): DTOProduto[] => {
  const resultProdutos: DTOProduto[] = []

  // verificar se cada produto existe na DB
  produtosId.forEach((v) => {
    let produto = dbProdutos.get(v)
    if (!produto) {
      throw new Error("produto não existe")
    }
    let p = { ...produto, id: v }
    resultProdutos.push(p)
  })
  return resultProdutos

}
app.get('/home', (req: any, res: any) => {
  console.log(dbProdutos)
  const produtos: DTOProduto[] = Array.from(dbProdutos).map((v) => ({id: v[0], ...v[1]})) 
  res.json({ produtos: produtos })
})


app.get('/produto/:id', (req: any, res: any) => {
  // id = req.query.id
  const id = req.params.id
  console.log("id", id);
  const produto = dbProdutos.get(id)
  if (!produto){
    return notFound("produto não foi encontrado")
  }
  res.json({ produto: { ...produto, id: id } })

});

app.get('/pedido', handlerUser, async (req, res) => {
  const meuspedidos = dbPedidos.get(req.user.id)
  if (!meuspedidos) {
    return res.json({pedidos: []})
  }
  if (meuspedidos.length > 1) {
    throw new Error("mais de 1 pedido encontrado")
  }
  return res.json({pedidos: meuspedidos.map((v) => v.produtos)})
})

app.get("/pedido", handlerUser, async (req, res) => {
  let pedidos = getPedidoList(req.user.id)
  if (!pedidos) {
    return notFound("lista de pedidos não existe")
  }
  return res.json({ pedidos: pedidos.map((p) => p.produtos) })


})
app.post('/pedido', handlerUser, async (req, res) => {
  console.log("post pedido body", req.body)
  const produtosId: string[] = req.body.produtos

  if (produtosId.length == 0) {
    throw new Error("um pedido precisa ter no mínimo 1 produto")
  }
  const produtos: DTOProduto[] = validateProdutos(produtosId)

  createPedido(req.user.id, produtos)

})
app.patch("/pedido/pagar", handlerUser, async (req, res) => {
  console.log("patch pedido body", req.body)
  // FIXME: acho q é importante verificar se o pedido atual do usuario é iguao ao da database

  let pedido = getPedidoCurrent(req.user.id)
  if (!pedido){
    return notFound("pedido não foi encontrado")
  }

  let valortotal = pedido.produtos.reduce((acc, cur) => cur.preco += acc, 0)
  let pix = await qrcodedynamic(_customer, valortotal)
  return res.json({ pix })
})
app.use(handlerError)

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
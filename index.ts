import express from 'express'
import cors from 'cors'
import { qrcodedynamic } from './asaas.js';
import type { DTOProduto } from './dto.js';
import { errorPostgres, handlerError, handlerUser, notFound } from './middlewares.js';
import { getPedidosByUserid, createPedido, supabase, produtoDbToDTO } from './db.js';


//import { asaasCreateCustomer, fetchAsaas, qrcodedynamic, qrcodestatic } from './asaas';
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json())
// FIXME: Não ta identificando o pedido certo, só pega o primeiro da lista (não da pra pagar outro pedido alem do primeiro)

let _customer: string
(async () => {
  _customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
})()

async function getPedidoCurrent(pessoa: string) {
  let pedidos = await getPedidosByUserid(pessoa)
  return pedidos[0]

}
const validateProdutos = async (produtosId: string[]): Promise<DTOProduto[]> => {
  let resultProdutos: DTOProduto[] = []

  // verificar se cada produto existe na DB
  for(const v of produtosId){
    const {data, error} = await supabase.from('Cookies').select().eq("id", v)
    if (error) return errorPostgres(error);
    let produto: DTOProduto = produtoDbToDTO(data[0])
    
    resultProdutos.push(produto)

  }
  return resultProdutos

}
app.get('/home', async (req, res) => {
  const { data, error } = await supabase.from('Cookies').select('*')
  console.log(data)
  if (error) return errorPostgres(error);
  const produtos: DTOProduto[] = data.map(v => produtoDbToDTO(v))//Array.from(dbProdutos).map((v) => ({id: v[0], ...v[1]})) 
  res.json({ produtos: produtos })
})


app.get('/produto/:id', async (req: any, res: any) => {
  // id = req.query.id
  const id = req.params.id
  const { data, error } = await supabase.from('Cookies').select().eq('id', id)
  console.log(data)
  if (error) return errorPostgres(error);
  if (data.length == 0) return res.json({produto: null});
  console.log("id", id);
  const produto: DTOProduto = produtoDbToDTO(data[0]) 
  if (!produto){
    return notFound("produto não foi encontrado")
  }
  res.json({ produto: produto })

});

app.get('/pedido', handlerUser, async (req, res) => {
  console.log("pedido user -", req.user.id, "-")
  const meuspedidos = await getPedidosByUserid(req.user.id) 
  console.log("pedidos", meuspedidos)
  if (meuspedidos.length > 1) {
    throw new Error("mais de 1 pedido encontrado")
  }
  return res.json({pedidos: meuspedidos.map((v) => v.produtos)})
})

app.post('/pedido', handlerUser, async (req, res) => {
  console.log("post pedido body", req.body)
  const produtosId: string[] = req.body.produtos

  if (produtosId.length == 0) {
    throw new Error("um pedido precisa ter no mínimo 1 produto")
  }
  const produtos: DTOProduto[] = await validateProdutos(produtosId)
  console.log("post pedido produtos", produtos)
  let pedido = createPedido({idUser: req.user.id, produtos: produtos})
  return res.json({pedido: pedido})
})
app.patch("/pedido/pagar", handlerUser, async (req, res) => {
  console.log("patch pedido body", req.body)
  // FIXME: acho q é importante verificar se o pedido atual do usuario é iguao ao da database

  let pedido = await getPedidoCurrent(req.user.id)
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
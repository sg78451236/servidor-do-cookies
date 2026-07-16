import express from 'express'
import cors from 'cors'
import { qrcodedynamic } from './asaas.js';
//import { asaasCreateCustomer, fetchAsaas, qrcodedynamic, qrcodestatic } from './asaas';
const app = express();
app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json())

// FIXME: Não ta identificando o pedido certo, só pega o primeiro da lista (não da pra pagar outro pedido alem do primeiro)
interface DTOProduto{
  name: string,
  preco: number,
  id: string,
}
interface Pessoa{
  nome: string,
  id: string,
}
interface Pedido{
  pessoa: Pessoa,
  produtos: DTOProduto[]
}
let databasehorrivel = new Map<string, Omit<DTOProduto, 'id'>>([
  ["cookieirado12309iawd", {
    name: "Cookie Irado",
    preco: 502309,
  }],
  ["outrocookie", {
    name: "Cookie Outro",
    preco: 10 
  }]
])
let pedidos = new Map<string, Pedido[]>()


app.get('/home', (req:any,res:any) => {
    console.log(databasehorrivel)
    res.json({abc: "teste", produtos: Array.from(databasehorrivel) })
})


app.get('/produto/:id', (req:any, res:any) => {
    // id = req.query.id
    const id = req.params.id
    console.log("id", id);
    res.json({produto: {...databasehorrivel.get(id), id: id}})

});


let _customer: string
(async () => {
   _customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
})()
app.get('/pedido', async (req, res) => {
  const pessoa: string = req.body.pessoa
  const meuspedidos = pedidos.get(pessoa)
  if (!meuspedidos){
    return res.sendStatus(500).send("pedidos não existe")
  }
  if (meuspedidos.length > 1){
    return res.sendStatus(500).send("mais de 1 pedido encontrado")
  }
  const pedido = meuspedidos[0]
  if (!pedido){
    return res.sendStatus(404).send("pedido não existe")
  }
  return res.json(pedido.produtos)
})

function getPedidoList(pessoa: string){
  let pedidoslist = pedidos.get(pessoa)
  if (!pedidoslist){
    pedidos.set(pessoa, [])
    pedidoslist = pedidos.get(pessoa)
  } 
  if (!pedidoslist){
    throw Error("não achou lista de pedidos")
  }
  return pedidoslist
}

function getPedido(pessoa: string){
  let lista = getPedidoList(pessoa)
  
  return lista[0]
}
function pushPedido(pessoa: string, produtos: DTOProduto[]){
  let pedidoslist = getPedidoList(pessoa)
  pedidoslist.push({pessoa: {id: pessoa, nome: "teste"}, produtos: produtos})
}
app.get("/pedido/:idPessoa", async (req, res) => {
  const pessoa: string = req.params.idPessoa
  try{
    let pedidos = getPedidoList(pessoa)
    return res.json({pedidos: pedidos.map((p) => p.produtos)})
  } catch (e){
    return res.sendStatus(400).json({error: "nenhum pedido encontrado"})
  }


})
app.post('/pedido', async (req, res) => {
  console.log("post pedido body", req.body)
  const produtos: string[] = req.body.produtos
  const pessoa: string = req.body.pessoa

  const produtosreais: DTOProduto[] = []
  let valortotal = 0

  if (produtos.length == 0){
    return res.sendStatus(400).json({error: "um pedido precisa ter no mínimo 1 produto"})
  }
  // verificar se cada produto existe na DB
  produtos.forEach((v) => {
    let produto = databasehorrivel.get(v)
    if (!produto){
      return res.sendStatus(500).json({error: "produto não existe"})
    }
    valortotal += produto.preco
    let p = {...produto, id: v}
    produtosreais.push(p)
  })

  try{
    pushPedido(pessoa, produtosreais)
  } catch(e){
    return res.sendStatus(500).json({error: "produto não existe"})
  }

  return res.sendStatus(200)
})
app.patch("/pedido/pagar", async (req, res) => {
  console.log("patch pedido body", req.body)
  // FIXME: acho q é importante verificar se o pedido atual do usuario é iguao ao da database
  let valortotal = 0
  const pessoa: string = req.body.pessoa
  let pedido;
  try {
    pedido = getPedido(pessoa) 
  } catch (e){
    console.log("error: ", e)
    return res.sendStatus(500).json({error: e})
  }
  if (!pedido){
    console.log("not pedido")
    return res.sendStatus(500).json({msg: "pedido não encontrado"})
  }
  pedido.produtos.forEach((v) => {
    valortotal += v.preco
  })
  let pix;
  try{
    pix = await qrcodedynamic(_customer, valortotal)
    return res.json({pix})
  } catch (e){
    console.log(e)
    return res.sendStatus(500).json({error: e})
  }
})

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { qrcodedynamic } from './asaas.js';
import type { DTOProduto, DTOUser } from './dto.js';
import { errorPostgres, handlerError, handlerLogged, handlerUser, notFound } from './middlewares.js';
import { getPedidosByUserid, createPedido, supabase, produtoDbToDTO, userGet, userCreate } from './db.js';
import { OAuth2Client } from 'google-auth-library';


export const jwtkey = "chavealeatoriaabalabala"

//import { asaasCreateCustomer, fetchAsaas, qrcodedynamic, qrcodestatic } from './asaas';
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json())
app.use(handlerUser)
// FIXME: Não ta identificando o pedido certo, só pega o primeiro da lista (não da pra pagar outro pedido alem do primeiro)

let _customer: string
(async () => {
  _customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
})()

async function getPedidoCurrent(pessoa: string) {
  let pedidos = await getPedidosByUserid(pessoa)
  return pedidos[0]

}
async function userFindOrCreate( email: string): Promise<DTOUser | null>{
  try{
    let user = await userGet(email)
    if (user){
      return user
    }
    return userCreate({email: email})
    
  } catch (e){
    return null
  }
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
  if (error) return errorPostgres(error);
  const produtos: DTOProduto[] = data.map(v => produtoDbToDTO(v))//Array.from(dbProdutos).map((v) => ({id: v[0], ...v[1]})) 
  res.json({ produtos: produtos })
})


app.get('/produto/:id', async (req: any, res: any) => {
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

app.get('/pedido', handlerLogged, async (req, res) => {
  const meuspedidos = await getPedidosByUserid(req.user.id) 
  if (meuspedidos.length > 1) {
    throw new Error("mais de 1 pedido encontrado")
  }
  return res.json({pedidos: meuspedidos.map((v) => v.produtos)})
})

app.post('/pedido', handlerLogged, async (req, res) => {
  const produtosId: string[] = req.body.produtos

  if (produtosId.length == 0) {
    throw new Error("um pedido precisa ter no mínimo 1 produto")
  }
  const produtos: DTOProduto[] = await validateProdutos(produtosId)
  let pedido = createPedido({idUser: req.user.id, produtos: produtos})
  return res.json({pedido: pedido})
})
app.patch("/pedido/pagar", handlerLogged, async (req, res) => {
  // FIXME: acho q é importante verificar se o pedido atual do usuario é iguao ao da database

  let pedido = await getPedidoCurrent(req.user.id)
  if (!pedido){
    return notFound("pedido não foi encontrado")
  }

  let valortotal = pedido.produtos.reduce((acc, cur) => cur.preco += acc, 0)
  let pix = await qrcodedynamic(_customer, valortotal)
  return res.json({ pix })
})

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
app.post("/auth/google", async (req, res) => {
  const token = req.body.token

  if (!token){
    return res.status(400).json({error: "token não fornecido"})
  }
  if (!process.env.GOOGLE_CLIENT_ID){
    return res.status(500).json({error: "somos burros e .env não tem google_client_id"})
  }
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload();
  if (!payload) {
    return res.status(401).json({ error: "token inválido" })
  }
  const { sub: googleId, email, name, picture } = payload
  if (!email){
    throw new Error("email undefined")
  }
  const user = await userFindOrCreate(email)
  if (!user){
    return notFound("user not found") 
  }
  const tokenSession = jwt.sign(user,  jwtkey)
  return res.json({
    user: { googleId, email, name, picture },
    token: tokenSession
  })
})
app.use(handlerError)

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
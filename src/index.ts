import express from 'express'
import cors from 'cors'
import { qrcodedynamic } from './asaas.js';
import type { DTOProduto, DTOUser } from './dto.js';
import { errorPostgres, handlerError, handlerLogged, handlerUser, notFound } from './middlewares.js';
import { getPedidosByUser, createPedido, supabase, produtoDbToDTO, userGet, userCreate } from './db.js';
import routerPedido from './routes/pedido.js'
import routerAuth from './routes/auth.js'

//import { asaasCreateCustomer, fetchAsaas, qrcodedynamic, qrcodestatic } from './asaas';
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json())
// FIXME: Não ta identificando o pedido certo, só pega o primeiro da lista (não da pra pagar outro pedido alem do primeiro)

app.use('/pedido', handlerUser, routerPedido)
app.use('/auth', routerAuth)



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


app.use(handlerError)

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
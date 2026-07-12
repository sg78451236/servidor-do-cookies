import express from 'express'
import cors from 'cors'
import { asaasCreateCustomer, fetchAsaas, qrcodedynamic, qrcodestatic } from './asaas';
const app = express();
app.use(cors({origin: "http://localhost:5173"}));


interface Produto{
  name: string,
  preco: number,
}
let databasehorrivel = new Map<string, Produto>([
  ["cookieirado12309iawd", {
    name: "Cookie Irado",
    preco: 502309,
  }],
  ["outrocookie", {
    name: "Cookie Outro",
    preco: 10 
  }]
])

app.get('/home', (req,res) => {
    res.json(databasehorrivel)
}
)


app.get('/produto/:id', (req, res) => {
    // id = req.query.id
    const id = req.params.id
    console.log("id", id);
    res.json({produto: databasehorrivel.get(id)})

});
let _customer: string
(async () => {
   _customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
})()
app.post('/pedido/:idProduto', async (req, res) => {
  const idProduto = req.params.idProduto
  const produto = databasehorrivel.get(idProduto)
  if (!produto){
    return res.sendStatus(500).send("produto não existe")
  }
  const pix = await qrcodedynamic(_customer, produto.preco)
  return res.json({pix})
})

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
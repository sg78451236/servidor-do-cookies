import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js';
//import { asaasCreateCustomer, fetchAsaas, qrcodedynamic, qrcodestatic } from './asaas';
// import.meta.resolve(.env)
import 'dotenv/config'
const app = express();
app.use(cors({origin: "http://localhost:5173"}));


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');




interface Produto{
  name: string,
  preco: number,
}

// let databasehorrivel = new Map<string, Produto>([
//   ["cookieirado12309iawd", {
//     name: "Cookie Irado",
//     preco: 502309,
//   }],
//   ["outrocookie", {
//     name: "Cookie Outro",
//     preco: 10 
//   }]
// ])

//const { data, error } = await supabase.from('Cookies').select().eq('id', id) //json com tudo fazer map q o id seja igual
const { data, error } = await supabase.from('Cookies').select('*')
if (error) {
  console.error("Supabase Error:", error);
} else {
  
  console.log(data);
}



app.get('/home', (req:any,res:any) => {
    console.log(data)
    res.json(data)
}
)


app.get('/produto/:id', async (req:any, res:any) => {
    // id = req.query.id
    const id = req.params.id
    const { data, error } = await supabase.from('Cookies').select().eq('id', id)

    
    res.json({produto: data})
});


// let _customer: string
// (async () => {
//    //_customer = process.env._CUSTOMER ?? ""//await asaasCreateCustomer()
// })()
// app.post('/pedido/:idProduto', async (req:any, res:any) => {
//   const idProduto = req.params.idProduto
//   const produto = databasehorrivel.get(idProduto)
//   if (!produto){
//     return res.sendStatus(500).send("produto não existe")
//   }
//   //const pix = await qrcodedynamic(_customer, produto.preco)
//   return 0 //res.json({pix})
// })

 app.listen(3000, () => {
   console.log(`Servidor rodando em http://localhost:${3000}`);
 });

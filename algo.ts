import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors({origin: "http://localhost:5173"}));

async function fetchAsaas(url: string, init?: RequestInit | undefined){
  if (!process.env.ASAAS_SB_ACCESS_TOKEN){
    console.log(process.env.ASAAS_SB_ACCESS_TOKEN)
    throw new Error("environment variable ASAAS_ACCESS_TOKEN not found")
  }
  return await fetch(`https://api-sandbox.asaas.com/v3/${url}`, { 
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "User-Agent": "cuquis",
      "access_token": process.env.ASAAS_SB_ACCESS_TOKEN,
    },
    ...init,
  }) 

}
async function qrcode(){
  const res = await fetchAsaas("pix/qrCodes/static", {method: 'POST'})
  console.log(res)
  const data = await res.json()
  console.log(data)
  return data
}

let databasehorrivel = new Map<string, any>([
  ["cookieirado12309iawd", {
    name: "Cookie Irado",
    preco: 502309,
  }],
  ["outrocookie", {
    name: "Cookie Outro",
    preco: 10 
  }]
])


app.get('/produto/:id', (req, res) => {
    // id = req.query.id
    const id = req.params.id
    console.log("id", id);
    res.json({produto: databasehorrivel.get(id)})

});

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
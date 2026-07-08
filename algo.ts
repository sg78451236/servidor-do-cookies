import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors({origin: "http://localhost:5173"}));

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
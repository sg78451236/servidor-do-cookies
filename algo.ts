import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors({origin: "http://localhost:5173"}));




app.get('/produto/:id', (req, res) => {
    // id = req.query.id
    const id = req.params.id
    console.log("id", id);
    res.json({produto: {name: "COOKIE", id: id, preco: 500}})

});

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
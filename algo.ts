import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors());




app.get('/produtoid13', (req, res) => {
  
    res.json({valor:22})

});

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
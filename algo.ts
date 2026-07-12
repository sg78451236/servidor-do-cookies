import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors());


interface Produto{
  preco: number,
  name: string,
  id: string
}

//o que tenho que fazer: pegar qnt de cookies (tamanho do array) e atualizar aquela lista lá

const produtos: Produto[] = [

  {preco: 30, name: "Chocolate Brasileiro",  id: '1'},
  {preco: 20, name: "Chocolate Belga", id: '2'},
  {preco: 40, name: "Chocolate Frances", id: '3'},
  {preco: 50, name: "Chocolate Judáico",id: '4'},
  {preco: 40, name: "Chocolate Ganês", id: '5'},
  {preco: 40, name: "Chocolate Chines", id: '6'},
  {preco: 40, name: "Chocolate Holandes Voador", id: '7'},
  {preco: 40, name: "Brisadeiro", id: '8'},
  {preco: 40, name: "Brisadeiro de cocaina", id: '9'},
  {preco: 40, name: "Brisadeiro de dapdoaspdok", id: '10'}

];

app.get('/home', (req,res) => {
    res.json(produtos)
}
)


app.get('/produto/:id', (req, res) => {

    const id_do_link = req.params.id;
    for (const element of produtos) {
      if (element.id === id_do_link) {
        res.json(element);
        return;
    }
  }

});

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
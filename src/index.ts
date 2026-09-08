import express from 'express'
import cors from 'cors'
import { handlerError, handlerLogged, handlerUser } from './middlewares.js';
import routerPedido from './routes/pedido.js'
import routerAuth from './routes/auth.js'
import routerProduto from './routes/produto.js'
import { getCommentsByProduct, postCommentByProduct } from './routes/comment.js'
import routerWebhooks from './routes/webhooks.js'
import routerPayment from './routes/payment.js'
import path from 'path'

const app = express();
app.use(cors({ origin: "*"}));
app.use(express.json())
// FIXME: Não ta identificando o pedido certo, só pega o primeiro da lista (não da pra pagar outro pedido alem do primeiro)

app.use('/order', handlerUser, routerPedido)
app.use('/auth', routerAuth)
app.use('/product', routerProduto)
app.get('/product/:id/comment', getCommentsByProduct)
app.post('/product/:id/comment', handlerUser, handlerLogged, postCommentByProduct)

app.use('/payment', routerPayment)
app.use('/webhooks', routerWebhooks)
app.use('/uploads', express.static(path.resolve('static/uploads')));




app.use(handlerError)

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});



import express from 'express'
import { payPedido } from '../db_reqs.js';
const router = express.Router()


router.post('/asaas', async (req, res) => {
  console.log('webhook asaas post', req.body)
  switch(req.body.event){
    case 'PAYMENT_CREATED':

    break;
    case 'PAYMENT_AUTHORIZED':

    break;
    case 'PAYMENT_CONFIRMED':

    break;
    case 'PAYMENT_RECEIVED':
      let orderId: string = req.body.payment.externalReference;
      payPedido(orderId);



    break;

  }
  console.log("webhook asaas");
  return res.json({received: true})

})


export default router

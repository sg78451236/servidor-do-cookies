

import express from 'express'
const router = express.Router()


router.post('/asaas', async (req, res) => {
  console.log('webhook asaas post', req.body)
  /*
  TODO:
  - descobrir usuario que pagou
  */
  switch(req.body.event){
    case 'PAYMENT_CREATED':

    break;
    case 'PAYMENT_AUTHORIZED':

    break;
    case 'PAYMENT_CONFIRMED':

    break;
    case 'PAYMENT_RECEIVED':
    req.body.payment.id
    break;

  }
  return res.json({received: true})

})


export default router
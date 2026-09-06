
export async function fetchAsaas(url: string, init?: RequestInit | undefined){
  if (!process.env.ASAAS_SB_ACCESS_TOKEN){
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
export async function qrcodestatic(){
  const res = await fetchAsaas("pix/qrCodes/static", {
    method: 'POST',
    body: JSON.stringify({
      "allowsMultiplePayments": false,
      "expirationSeconds": 60*30 // 30min
    })
  })
  const data = await res.json()
  return data
}
export async function asaasCreateCustomer(){
  const res = await fetchAsaas("customers", {
    method: 'POST',
    body: JSON.stringify({
      name: "cliente-cuquis",
      cpfCnpj: process.env._CPF
    })
  })
  const data = await res.json()
  return data
}
export async function qrcodedynamic(idCustomer: string, idOrder: string, value: number){
  const res = await fetchAsaas("lean/payments", {
    method: 'POST',
    body: JSON.stringify({
      "customer": idCustomer,
      "externalReference": idOrder,
      "billingType": "PIX",
      "value": value,
      "dueDate": new Date().toISOString().split('T')[0],
    })
  })
  const data = await res.json()
  if (!res.ok){
    throw new Error(data)
  }

  const r = await fetchAsaas(`payments/${data.id}/pixQrCode`, {
    method: 'GET',
  })  
  const d = await r.json()
  if (!r.ok){
    throw new Error(d)
  }
  return d
}
export async function asaasCreateWebhook(){
  const options = {
    method: 'POST',
    body: JSON.stringify({
      enabled: true,
      interrupted: false,
      sendType: 'NON_SEQUENTIALLY',
      events: ['PAYMENT_AUTHORIZED', 'PAYMENT_RECEIVED', 'PAYMENT_CREATED', 'PAYMENT_CONFIRMED'],
      name: "cuquis-pix",
      email: "droitubez@gmail.com",
      url: "https://servidor-do-cookies.onrender.com/webhooks/asaas",
    })
  };
  const res = await fetchAsaas('webhooks', options)
  console.log(res)
  const d = await res.json()
  console.log(d)
}
export async function asaasListarWebhooks(){
  const res = await fetchAsaas('webhooks')
  console.log(res)
  const d = await res.json()
  console.log(d.data)
}
// asaasCreateWebhook();
// asaasListarWebhooks();

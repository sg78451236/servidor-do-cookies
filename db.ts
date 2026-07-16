import type { DTOProduto } from "./dto"


interface Pedido {
  idUser: string,
  produtos: DTOProduto[]
}
export let dbProdutos = new Map<string, Omit<DTOProduto, 'id'>>([
  ["cookieirado12309iawd", {
    name: "Cookie Irado",
    preco: 502309,
  }],
  ["outrocookie", {
    name: "Cookie Outro",
    preco: 10
  }]
])
export let dbPedidos = new Map<string, Pedido[]>()



export function getPedidoList(pessoa: string) {
  let pedidoslist = dbPedidos.get(pessoa)
  if (!pedidoslist) {
    dbPedidos.set(pessoa, [])
    pedidoslist = dbPedidos.get(pessoa)
  }
  return pedidoslist
}
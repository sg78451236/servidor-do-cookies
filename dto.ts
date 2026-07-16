
export interface DTOProduto{
  name: string,
  preco: number,
  id: string,
}
export interface DTOPedido {
  idUser: string,
  produtos: DTOProduto[]
}

export interface DTOProduto{
  name: string,
  preco: number,
  id: string,
  image?: string,
}
export interface DTOPedido {
  idUser: string,
  produtos: DTOProduto[]
}
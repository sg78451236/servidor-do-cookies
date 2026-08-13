
export interface DTOProduto{
  name: string,
  preco: number,
  id: string,
  image?: string,
}
export interface DTOPedido<T = string | DTOProduto>{
  id: string,
  user: string,
  products: T[],
}


export interface DTOComment{
  analise: string
  email: string,
}
export interface DTOUser{
  name?: string,
  email: string,
}

export type AnyDTOs = DTOProduto | DTOPedido | DTOComment | DTOUser
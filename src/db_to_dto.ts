import type { DTOComment, DTOPedido, DTOProduto, DTOUser } from "./dto.js";
import type { Database } from "./supabase.js";

export const Tables = {
  user: 'user',
  order: 'order',
  cookie: 'Cookies',
  comment: 'Comentarios',
} as const;
export type TableName = keyof typeof Tables
export interface Table2DTO {
  user: DTOUser,
  order: DTOPedido,
  cookie: DTOProduto,
  comment: DTOComment,
}

export type TableRow<K extends TableName> =
  Database['public']['Tables'][(typeof Tables)[K]]['Row'];


export type TableInsert<K extends TableName> =
  Database['public']['Tables'][(typeof Tables)[K]]['Insert'];

export const produtoDbToDTO = (produto: TableRow<'cookie'>): DTOProduto => {
  const result: DTOProduto = {id: produto.id, name: produto.nome ?? "não nomeado", preco: produto.preco, ...(produto.image != null ? {image: produto.image} : {})}
  return result
}
export const pedidoDbToDTO = (pedido: TableRow<'order'>): undefined | DTOPedido<string> => {
  // FIXME: verificando cada union 1 a 1. duplicação de codigo, o melhor jeito seria definir union no supabase tbm
  if (pedido.status != "pending" && pedido.status != "paid") {
    console.log("pedido nao pode ser convertido pra dto");
    return undefined;
  }
  const result: DTOPedido<string> = {id: pedido.id, products: pedido.products, user: pedido.user, status: pedido.status as DTOPedido<string>['status']};
  return result
}

export const commentDbtoDTO = (comment: TableRow<'comment'>):  DTOComment => {
  const result: DTOComment = {userId: comment.email, analise: comment.analise, idProduct: comment.fk_id}
  return result
}
export const userDbtoDTO = (user: TableRow<'user'>): DTOUser => {
  const result : DTOUser = {name: user.name, email: user.email}
  return result
}


const Table2DTOFn = {
  user: userDbtoDTO,
  cookie: produtoDbToDTO,
  comment: commentDbtoDTO,
  order: pedidoDbToDTO,
  

} 

  
export function db2dto<K extends TableName>(name: K, obj: TableRow<K>): Table2DTO[K]{
  return ( Table2DTOFn[name] as (obj: TableRow<K>) => Table2DTO[K] )(obj);
}

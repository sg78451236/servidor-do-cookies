import { createClient, type PostgrestFilterBuilder, type PostgrestResponse } from "@supabase/supabase-js";
import type {  DTOComment, DTOPedido, DTOProduto, DTOUser } from "./dto.js"
import { errorPostgres } from "./middlewares.js";

import type { Database } from "./supabase.js";


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SECRET_KEY;
console.log("supabase url", supabaseUrl)
console.log("supabase key", supabaseKey)


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

if (!supabaseUrl){
  throw new Error("not supabaseurl");
}
if (!supabaseKey){
  throw new Error("not supabasekey");
}
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const produtoDbToDTO = (produto: TableRow<'cookie'>): DTOProduto => {
  const result: DTOProduto = {id: produto.id, name: produto.nome ?? "não nomeado", preco: produto.preco, ...(produto.image != null ? {image: produto.image} : {})}
  return result
}
export const pedidoDbToDTO = (pedido: TableRow<'order'>): DTOPedido<string> => {
  const result: DTOPedido<string> = {id: pedido.id, products: pedido.products, user: pedido.user}
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
function baseQuery<K extends TableName>(tablename: K) {
  return supabase.from(Tables[tablename] as (typeof Tables)[K]).select('*');
}
export async function dbGet<K extends TableName, R extends TableRow<K>[]>(
  tablename: K,
  buildQuery?: (query: ReturnType<typeof baseQuery<K>>) => any
): Promise<(Table2DTO[K])[]> {
  let query: any = baseQuery(tablename);

  if (buildQuery) {
    query = buildQuery(query);
  }

  const { data, error } = await query;
  console.log('data', data)
  if (error) return errorPostgres(error);
  
  const d = (data as R).map((v) => db2dto(tablename, v))
  console.log('d', d)
  return d
} 

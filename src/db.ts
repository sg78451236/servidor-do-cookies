import { createClient, type PostgrestFilterBuilder, type PostgrestResponse } from "@supabase/supabase-js";
import type { AnyDTOs, DTOComment, DTOPedido, DTOProduto, DTOUser } from "./dto.js"
import { errorPostgres } from "./middlewares.js";

import type { Database } from "./supabase.js";


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SECRET_KEY;
console.log("env", process.env)
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


if (!supabaseUrl){
  throw new Error("not supabaseurl");
}
if (!supabaseKey){
  throw new Error("not supabasekey");
}
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const produtoDbToDTO = (produto: any): DTOProduto => {
  const result: DTOProduto = {id: produto.id, name: produto.nome, preco: produto.preco, image: produto.image}
  return result
}
export const pedidoDbToDTO = (pedido: any): DTOPedido<string> => {
  const result: DTOPedido<string> = {id: pedido.id, products: pedido.products, user: pedido.user}
  return result
}
export const userDbToDTO = (user: any): DTOUser => {
  const result: DTOUser = {name: user.name, email: user.email}
  return result
}

export const commentDbtoDTO = (comment: any):  DTOComment => {
  const result: DTOComment = {email: comment.email, analise: comment.analise}
  return result
}
export const userDbtoDTO = (user: any): DTOUser => {
  const result : DTOUser = {email: user.email}
  return result
}


type AnyTable = Database['public']['Tables'][keyof Database['public']['Tables']]['Row'];
const Table2DTOFn = {
  user: userDbtoDTO,
  cookie: produtoDbToDTO,
  comment: commentDbtoDTO,
  order: pedidoDbToDTO,
  

} 
type DbTableRow<K extends TableName> =
  Database['public']['Tables'][(typeof Tables)[K]]['Row'];

  
function db2dto<K extends TableName>(name: K, obj: DbTableRow<K>): Table2DTO[K]{
  return ( Table2DTOFn[name] as (obj: DbTableRow<K>) => Table2DTO[K] )(obj);
}
function baseQuery<K extends TableName>(tablename: K) {
  return supabase.from(Tables[tablename] as (typeof Tables)[K]).select('*');
}
export async function dbGet<K extends TableName, R extends DbTableRow<K>[]>(
  tablename: K,
  buildQuery?: (query: ReturnType<typeof baseQuery<K>>) => any
): Promise<(Table2DTO[K])[]> {
  let query: any = baseQuery(tablename);

  if (buildQuery) {
    query = buildQuery(query);
  }

  const { data, error } = await query;

  if (error) return errorPostgres(error);
  
  return (data as R).map((v) => db2dto(tablename, v))
} 
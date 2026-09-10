import { dbGet, supabase } from "./db.js";
import { Tables, type TableInsert, type TableRow } from "./db_to_dto.js";
import type { DTOComment, DTOPedido, DTOProduto, DTOUser } from "./dto.js";
import { errorPostgres } from "./middlewares.js";


export async function getProdutoById(id: string): Promise<DTOProduto | null>{
  const data = await dbGet('cookie', (q) => q.eq('id', id)) 
  return data[0] ?? null

}
export async function createProduto(produto: TableInsert<"cookie">) {

  const {data, error} = await supabase.from(Tables.cookie).insert(produto)
  if (error) return errorPostgres(error);
}
export async function getPedidosByUser(email: string): Promise<DTOPedido<string>[]>{
  return await dbGet('order', (q) => q.eq("user", email)) as DTOPedido<string>[]
  
  
}
export async function getProdutos(){
  const produtos = dbGet('comment')
  return produtos
}
export async function getPedidoById(id: string){
  const data = await dbGet('order', (q) => q.eq('id', id))
  if (data.length == 0) return null
  return data[0] as DTOPedido<string>
}
export async function createPedido(produtos_id: string[], user: string){
  const row = {products: produtos_id, user: user}
  console.log("create order", row);
  const {data, error} = await supabase.from(Tables.order).insert(row)
  if (error) return errorPostgres(error);
}
export async function payPedido(id: string){
  const data = await supabase.from(Tables.order).update({status: "paid"}).eq("id", id);
  console.log("pay pedido", data);

}


export async function userCreate(user: DTOUser){
  const row: TableInsert<'user'> = {name: user.name ?? 'guest', email: user.email}
  const {data, error} = await supabase.from(Tables.user).insert(row)
  if (error) return errorPostgres(error);

}
export async function userGet(email: string){
  const data = await dbGet('user', (q) => q.eq('email', email))
  if (data.length == 0) return null;
  return data[0]   
}


export async function commentGet(idProduct: string){
  return await dbGet('comment', (q) => q.eq('fk_id', idProduct))
}
export async function commentCreate(comment: DTOComment){
  const row: TableInsert<'comment'> = {analise: comment.analise, email: comment.userId, fk_id: comment.idProduct}
  const {data, error} = await supabase.from(Tables.comment).insert(row)
  if (error) return errorPostgres(error)
}


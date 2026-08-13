import { dbGet, pedidoDbToDTO, produtoDbToDTO, supabase, Tables, userDbToDTO } from "./db";
import type { DTOPedido, DTOProduto, DTOUser } from "./dto";
import { errorPostgres } from "./middlewares";


export async function getProdutoById(id: string): Promise<DTOProduto | null>{
  const data = await dbGet('cookie', (q) => q.eq('id', id)) 
  return data[0] ?? null

}
export async function getPedidosByUser(email: string): Promise<DTOPedido<string>[]>{
  return await dbGet('order', (q) => q.eq("user", email)) as DTOPedido<string>[]
  
  
}
export async function getPedidoById(id: string){
  const data = await dbGet('order', (q) => q.eq('id', id))
  if (data.length == 0) return null
  return data
}
export async function createPedido(produtos: DTOProduto[], user: string){
  const row = {products: produtos.map((v) => v.id), user: user}
  const {data, error} = await supabase.from("order").insert(row)
  if (error) return errorPostgres(error);
}


export async function userCreate(user: DTOUser){
  const row = {name: user.name, email: user.email}
  const {data, error} = await supabase.from("user").insert(row)
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
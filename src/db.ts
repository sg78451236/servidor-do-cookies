import { createClient } from "@supabase/supabase-js";
import type { DTOPedido, DTOProduto, DTOUser } from "./dto.js"
import { errorPostgres } from "./middlewares.js";


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SECRET_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

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

export async function getProdutoById(id: string): Promise<DTOProduto>{
  const { data, error } = await supabase.from('Cookies').select().eq('id', id)
  if (error) return errorPostgres(error);
  return produtoDbToDTO(data[0])
}
export async function getPedidosByUser(email: string): Promise<DTOPedido<string>[]>{
  const {data, error} = await supabase.from("order").select().eq("user", email)
  console.log(data)
  if (error) return errorPostgres(error);
  return data.map((v) => pedidoDbToDTO(v))
}
export async function getPedidoById(id: string){
  const {data, error} = await supabase.from("order").select().eq("id", id)
  if (error) return errorPostgres(error)
  if (data.length == 0) return null
  return pedidoDbToDTO(data[0])
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
  const {data, error} = await supabase.from("user").select().eq("email", email)
  if (error) return errorPostgres(error)
  if (data.length == 0) return null
  return userDbToDTO(data[0])
}
import { createClient } from "@supabase/supabase-js";
import type { DTOPedido, DTOProduto, DTOUser } from "./dto.js"
import { errorPostgres } from "./middlewares.js";


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export let dbPedidos = new Map<string, DTOPedido[]>()


export const produtoDbToDTO = (produto: any): DTOProduto => {
  const result: DTOProduto = {id: produto.id, name: produto.nome, preco: produto.preco, image: produto.image}
  return result
}
export const pedidoDbToDTO = (pedido: any): DTOPedido => {
  const result: DTOPedido = {...pedido}
  return result
}
export const userDbToDTO = (user: any): DTOUser => {
  const result: DTOUser = {...user}
  return result
}

export async function getProdutoById(id: string): Promise<DTOProduto>{
  const { data, error } = await supabase.from('Cookies').select().eq('id', id)
  if (error) return errorPostgres(error);
  return produtoDbToDTO(data[0])
}
export async function getPedidosByUserid(userid: string): Promise<DTOPedido[]>{
  let pedidos = dbPedidos.get(userid)
  if (pedidos === undefined) return []
  pedidos = pedidos.map((v) => pedidoDbToDTO(v));
  return pedidos
}
export async function createPedido(pedido: DTOPedido){
  const l = dbPedidos.get(pedido.idUser)
  if (l === undefined){
    dbPedidos.set(pedido.idUser, [pedido])
    return pedido
  }
  l.push(pedido)
  return pedido
}


export async function userCreate(user: DTOUser){
  const row = {name: user.name, email: user.email}
  const {data, error} = await supabase.from("user").insert(row)
  if (error) return errorPostgres(error);
  return userDbToDTO(row)
}
export async function userGet(email: string){
  const {data, error} = await supabase.from("user").select().eq("email", email)
  if (error) return errorPostgres(error)
  return userDbToDTO(data[0])
}
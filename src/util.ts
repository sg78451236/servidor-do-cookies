import { supabase } from "./db.js";
import { getPedidosByUser, getProdutoById } from "./db_reqs.js";
import { db2dto, Tables, type Table2DTO, type TableName, type TableRow } from "./db_to_dto.js";
import type { DTOPedido, DTOProduto } from "./dto.js";
import { errorPostgres } from "./middlewares.js";

// TODO: organizar melhor esse arquivo pq tem varias funções aleatórias


// FIXME: retornar tipo certo
export async function idsToDBRow<T extends TableName>
(ids: string[], table: T, column: keyof TableRow<T> & string): Promise<Table2DTO[T][]> {
  // FIXME: se ja ta recebendo a table ent n deveria precisar receber a column (ex: "id")
  let result: Table2DTO[T][] = []
  for(const id of ids){
    const {data, error} = await supabase.from(Tables[table]).select()
      .eq(column as any, id) // FIXME: as any
    if (error) return errorPostgres(error);
    if (!data || !data[0]){
      continue;
    }
    let dto = db2dto(table, data[0] as any)
    
    result.push(dto)

  }
  return result


}

export async function setPedidoProducts(pedido: DTOPedido<string>) {
    return {
      ...pedido,
      products: (await Promise.all(
	pedido.products.map(id => getProdutoById(id))
      )).filter(p => p !== null)
    }
}
export async function queryProductsIdOnly(productsIdOnly: boolean, pedido: DTOPedido<string>){

  if (productsIdOnly){
    return pedido
  }

  let pedido_dto: DTOPedido<DTOProduto> = await setPedidoProducts(pedido) 
  return pedido_dto
} 
function isOrderPending(order: DTOPedido){
  return order.status == "pending";
}
export async function userHasOrderPending(idUser: string){

  const orders = await getPedidosByUser(idUser);
  console.log("orders", orders);
  let orderPending = orders.find((v) => isOrderPending(v));
  return orderPending
  
}

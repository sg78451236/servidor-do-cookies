import { createClient, type PostgrestFilterBuilder, type PostgrestResponse } from "@supabase/supabase-js";
import { errorPostgres } from "./middlewares.js";

import type { Database } from "./supabase.js";
import { db2dto, Tables, type Table2DTO, type TableName, type TableRow } from "./db_to_dto.js";


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SECRET_KEY;
console.log("supabase url", supabaseUrl)
console.log("supabase key", supabaseKey)



if (!supabaseUrl){
  throw new Error("not supabaseurl");
}
if (!supabaseKey){
  throw new Error("not supabasekey");
}
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

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
  if (error) return errorPostgres(error);
  
  const d = (data as R).map((v) => db2dto(tablename, v))
  console.log('d', d)
  return d
} 

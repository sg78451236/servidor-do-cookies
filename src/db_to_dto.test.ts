import assert, { deepEqual } from "node:assert"
import type { DTOComment, DTOPedido, DTOProduto, DTOUser } from "./dto.js"
import { test, expect, describe } from "vitest"
import { db2dto, type TableRow } from "./db_to_dto.js"



describe('convertion of database objects to DTOs', () => {

  test('user', () => {
    const objdb_date_wrong: TableRow<"user"> = {
      created_at: "invalido",
      email: "email invalido",
      name: "nome qualquer",
    } 
    const objdb_date_right: TableRow<"user"> = {
      created_at: "2026-08-15 13:01:18.508048+00",
      email: "email invalido",
      name: "nome qualquer",
    } 

    const expected_date_wrong: DTOUser = {
      email: objdb_date_wrong.email,
      name: objdb_date_wrong.name,
    }
    const expected_date_right: DTOUser = {
      email: objdb_date_right.email,
      name: objdb_date_wrong.name,
    }

    const dtoobj_date_wrong = db2dto("user", objdb_date_wrong)
    const dtoobj_date_right = db2dto("user", objdb_date_right)
    // assert.deepEqual(expected_date_wrong, dtoobj_date_wrong);
    // assert.deepEqual(expected_date_right, dtoobj_date_right);
    expect(dtoobj_date_wrong).toEqual(expected_date_wrong);
    expect(dtoobj_date_right).toEqual(expected_date_right);
  })

  test('order', () => {
    const objdb: TableRow<"order"> = {
      created_at: "invalido",
      id: "qualquer",
      user: "qualquer",
      products: ["qualquer1", "qualquer2"],
      status: "pending",
    }
    const expected: DTOPedido = {
      id: "qualquer",
      user: "qualquer",
      products: ["qualquer1", "qualquer2"],
      status: "pending",
      
    }
    const objdto = db2dto("order", objdb)

    // assert.deepEqual(expected, objdto)
    expect(objdto).toEqual(expected);
  })

  test('product', () => {
    const objdb: TableRow<"cookie"> = {
      id: "qualquer",
      image: null,
      nome: "qualquer",
      preco: 100.5,
    }

    const expected: DTOProduto = {
      id: objdb.id,
      name: objdb.nome ?? "não nomeado",
      preco: objdb.preco,
    }
    const objdto = db2dto("cookie", objdb)

    // assert.deepEqual(expected, objdto)
    expect(objdto).toEqual(expected);
  })

  test('comment', () => {
    const objdb: TableRow<"comment"> = {
      analise: "qualquer",
      created_at: "invalido",
      fk_id: "qualquer",
      id: "qualquer",
      email: "qualquer",
    }
    const expected: DTOComment = {
      analise: objdb.analise,
      idProduct: objdb.fk_id,
      userId: objdb.email,
    }

    const objdto = db2dto("comment", objdb)
    // assert.deepEqual(expected, objdto)
    expect(objdto).toEqual(expected); 
  })
})

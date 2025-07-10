import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary();
    table.enum("type", ["debit", "credit"]).notNullable();
    table.decimal("amount", 10, 2).notNullable();
    table.text("description").nullable();
    table.string("reference", 255).nullable();
    table
      .integer("from_wallet_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("wallets");
    table
      .integer("to_wallet_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("wallets");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("transactions");
}

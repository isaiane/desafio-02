import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.date('date').notNullable()
    table.time('time').notNullable()
    table.boolean('isDiet').notNullable()
    table.integer('userId').unsigned().notNullable()
    table.foreign('userId').references('id').inTable('users')
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}

import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id')
    table.string('name').notNullable()
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now())
    table.timestamp('lastLoginAt').nullable()
    table.string('token').nullable()
    table.timestamp('tokenExpiresAt').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}

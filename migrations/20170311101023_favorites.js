//
exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments('id').primary();
    table.integer('book_id').references('id').inTable('books')
    .notNullable().onDelete('cascade');
    table.integer('user_id').references('id').inTable('users')
    .notNullable().onDelete('cascade');
    table.timestamps(true, true);
  });
};
//
exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites');
};

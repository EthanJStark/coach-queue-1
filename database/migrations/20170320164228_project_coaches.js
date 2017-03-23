exports.up = knex =>
  knex.schema.createTable('project_coaches', table => {
    table.integer('project_id').notNullable()
    table.integer('coach_id').notNullable()
  })

exports.down = knex => knex.schema.dropTable('project_coaches')
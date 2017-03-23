const knex = require('./knex')

module.exports = {}

if (process.env.NODE_ENV === 'test') {
  module.exports.reset = () =>
    knex.migrate.latest().then( () =>
      Promise.all([
        knex.truncate('events'),
        knex.truncate('requests'),
        knex.truncate('teams'),
        knex.truncate('team_players'),
        knex.truncate('players'),
        knex.truncate('projects'),
        knex.truncate('project_coaches'),
      ])
  )
}
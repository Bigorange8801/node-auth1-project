const knex = require('knex');

const db = knex(require('../knexfile.js'));

module.exports = db;
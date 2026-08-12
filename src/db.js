const { Pool } = require('pg');

function createDb(connectionString) {
  return new Pool({ connectionString });
}

module.exports = { createDb };

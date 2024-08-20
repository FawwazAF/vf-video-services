const { Pool } = require('pg');

const postgres = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'postgres',
    password: 'mypassword', 
    port: 5432,         
});

module.exports = postgres;

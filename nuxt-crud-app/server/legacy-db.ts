import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: 'polivalka2',
    password: 'strongpassword',
    database: 'dropstation'
});

export default pool;

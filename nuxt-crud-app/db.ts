import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: 'polivalka2', // replace with your MySQL username
    password: 'strongpassword', // replace with your MySQL password
    database: 'dropstation'
});

export default pool;

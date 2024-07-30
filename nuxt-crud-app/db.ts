import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: 'magento2', // replace with your MySQL username
    password: 'gotechnies', // replace with your MySQL password
    database: 'dropstation'
});

export default pool;

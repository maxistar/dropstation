import { defineEventHandler, readBody } from 'h3';
import pool from '../../db';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const [rows] = await pool.query('SELECT * FROM devices');
    return rows;
});

import { defineEventHandler, getQuery } from 'h3';
import pool from '../../../db';

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'GET') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    }

    const { id } = event.context.params;

    const [rows] = await pool.query('SELECT * FROM devices WHERE id = ?', [id]);
    return rows[0];
});

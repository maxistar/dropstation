import { defineEventHandler, getQuery } from 'h3';
import pool from '../../../db';

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'DELETE') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    }

    const { id } = getQuery(event);
    await pool.query('DELETE FROM devices WHERE id = ?', [id]);
    return { message: 'Device deleted successfully' };
});

import { defineEventHandler } from 'h3';
import pool from '../legacy-db';

export default defineEventHandler(async (event) => {
    // Legacy endpoint kept only for compatibility while migration rolls out.
    // Active places admin flow now uses backend-ts `/api/ui/v1/places`.
    const method = event.req.method;

    if (method !== 'GET') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    }

    const [rows] = await pool.query('SELECT * FROM places');
    return rows;
});

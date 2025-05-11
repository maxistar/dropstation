import { defineEventHandler, readBody } from 'h3';
import pool from '../../../db';

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'POST') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    }

    const body = await readBody(event);
    const { id, name, notes, deviceKey } = body;

    await pool.query(
        'UPDATE devices SET name = ?, notes = ?, device_key = ? WHERE id = ?',
        [name, notes, deviceKey, id]
    );

    return { id, name, notes, deviceKey };
});

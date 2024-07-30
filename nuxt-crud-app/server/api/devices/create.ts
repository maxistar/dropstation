import { defineEventHandler, readBody } from 'h3';
import pool from '../../../db';

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'POST') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    }

    const body = await readBody(event);
    const { name, notes, deviceKey } = body;

    const [result] = await pool.query(
        'INSERT INTO devices (name, notes, device_key) VALUES (?, ?, ?)',
        [name, notes, deviceKey]
    );

    return { id: result.insertId, name, notes, deviceKey };
});

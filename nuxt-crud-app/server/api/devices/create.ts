import { defineEventHandler, readBody } from 'h3';
import pool from '../../../db';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { name, notes, deviceKey } = body;

    const [result] = await pool.query(
        'INSERT INTO devices (name, notes, device_key) VALUES (?, ?, ?)',
        [name, notes, deviceKey]
    );

    return { id: result.insertId, name, notes, deviceKey };
});

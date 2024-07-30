import { defineEventHandler, getQuery } from 'h3';
import pool from '../../../db';

export default defineEventHandler(async (event) => {
    const { id } = getQuery(event);
    const [rows] = await pool.query('SELECT * FROM devices WHERE id = ?', [id]);
    return rows[0];
});

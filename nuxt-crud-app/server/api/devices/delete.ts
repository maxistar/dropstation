import { defineEventHandler, getQuery } from 'h3';
import pool from '../../../db';

export default defineEventHandler(async (event) => {
    const { id } = getQuery(event);

    await pool.query('DELETE FROM devices WHERE id = ?', [id]);

    return { message: 'Device deleted successfully' };
});

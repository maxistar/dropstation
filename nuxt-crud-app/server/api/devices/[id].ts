import { defineEventHandler, getQuery } from 'h3';
import pool from '../../../db';
import type { RowDataPacket } from "mysql2";

interface Device {
    id: number;
    name: string;
    status: string;
    // add other fields here based on your table structure
}

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'GET') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    }

    const { id } = event.context.params as Record<string, any>;
    // const { id } = event.context.params;

    const [rows] = await pool.query<Device & RowDataPacket[]>('SELECT * FROM devices WHERE id = ?', [id]);
    return rows[0];
});

import { kv } from '@vercel/kv';
import type { NextApiResponse, NextApiRequest, PageConfig } from 'next';
import { v4 as uuid } from 'uuid';

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse,
) {
    const id = uuid();
    await kv.set(id, request.body);
    return response.status(200).json(id);
}

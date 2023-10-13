import { kv } from '@vercel/kv';
import type { NextApiResponse, NextApiRequest, PageConfig } from 'next';

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse,
) {
    const id = request.query['id'] as string;
    return response.status(200).json(await kv.get(id));
}

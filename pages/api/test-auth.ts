import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    
    return res.json({
        hasSession: !!session,
        session: session,
        cookies: req.headers.cookie,
    });
}
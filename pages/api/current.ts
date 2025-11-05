import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/lib/serverAuth";
import { getSession } from 'next-auth/react';
import prismadb from '@/lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

        try {
            // Prefer using the session directly so we can gracefully handle
            // missing DB tables or auth problems without throwing.
            const session = await getSession({ req });

            if (!session?.user?.email) {
                // Development-friendly: return null so the client won't treat this as an error.
                return res.status(200).json(null);
            }

            try {
                const user = await prismadb.user.findUnique({
                    where: { email: session.user.email }
                });

                return res.status(200).json(user ?? null);
            } catch (err) {
                // Prisma error (tables missing, etc.) — return null so client stays stable.
                console.debug('/api/current: prisma lookup failed — returning null', err);
                return res.status(200).json(null);
            }
        } catch (error) {
            console.error('/api/current unexpected error:', error);
            return res.status(200).json(null);
        }
}
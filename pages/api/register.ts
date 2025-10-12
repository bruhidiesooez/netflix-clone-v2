import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';
import { hash } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email, name, password } = req.body ?? {};

        // Basic validation
        if (!email || !name || !password) {
            return res.status(400).json({ error: 'Missing required fields: email, name, password' });
        }

        const existingUser = await prismadb.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(422).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prismadb.user.create({
            data: {
                email,
                name,
                hashedPassword,
                image: '',
                emailVerified: new Date(),
            }
        });

        // Return minimal public fields
        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            createdAt: user.createdAt,
        };

        return res.status(201).json(safeUser);
    } catch (error) {
        console.error('Register API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
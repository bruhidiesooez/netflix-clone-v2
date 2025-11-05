import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "@/lib/prismadb";
import { getRandomMovie } from '@/lib/moviesData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }
    try {
        // Public endpoint: return a random movie without requiring authentication
        const movieCount = await prismadb.movie.count();
        if (movieCount === 0) {
            return res.status(404).json({ error: 'No movies found' });
        }

        const randomIndex = Math.floor(Math.random() * movieCount);

        const randomMovies = await prismadb.movie.findMany({
            take: 1,
            skip: randomIndex,
        });

        return res.status(200).json(randomMovies[0]);
    } catch (error) {
        // Avoid printing full error stacks for missing tables in normal dev runs.
        const DEBUG = process.env.DEBUG === 'true';
        if (DEBUG) {
            console.error(error);
            console.error('[RANDOM_API_ERROR]', error);
        } else {
            console.warn('[RANDOM_API_ERROR]', (error as Error)?.message ?? error);
        }
        // Fallback to bundled sample data when the DB/table isn't available so the
        // billboard still shows a randomized movie during development.
        try {
            const fallback = getRandomMovie();
            if (!fallback) {
                return res.status(404).json({ error: 'No movies available' });
            }
            return res.status(200).json(fallback);
        } catch (e) {
            console.error('[RANDOM_FALLBACK_ERROR]', e);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

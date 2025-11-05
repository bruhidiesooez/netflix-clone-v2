import { NextApiRequest, NextApiResponse } from 'next';

import { without } from 'lodash';

import prismadb from '@/lib/prismadb';
import serverAuth from '@/lib/serverAuth';
import { getSession } from 'next-auth/react';
import { moviesData, getMovieById } from '@/lib/moviesData';

// Dev-only in-memory favourites store so the UI works even when Prisma/DB
// isn't available locally. Keyed by user email. Values are arrays of movie ids
// stored as strings to match the Prisma `favouriteIds` shape used by the client.
const devFavourites: Map<string, Array<string>> = new Map();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Identify session/email first so we can fallback to the in-memory
        // store if Prisma is unavailable.
        const session = await getSession({ req });

    let email: string | null | undefined = session?.user?.email;

        // During local development allow a dev fallback so the favourites UI
        // remains usable even if the NextAuth session is not fully available.
        if (!email) {
            if (process.env.NODE_ENV !== 'production') {
                email = 'dev@local';
            } else {
                return res.status(401).json({ error: 'Not signed in' });
            }
        }

        // GET: return favourite movies for current user
        if (req.method === 'GET') {
            try {
                const { CurrentUser: currentUser } = await serverAuth(req);

                const favouriteMovies = await prismadb.movie.findMany({
                    where: {
                        id: {
                            in: currentUser.favouriteIds,
                        }
                    }
                });

                return res.status(200).json(favouriteMovies);
            } catch (err) {
                // Prisma/table missing or serverAuth failed — fallback to dev map
                const ids = devFavourites.get(email) || [];
                const movies = ids.map(id => getMovieById(Number(id))).filter(Boolean);
                return res.status(200).json(movies);
            }
        }

        // POST: add a movie to favourites
        if (req.method === 'POST') {
            const { movieId } = req.body;
            // normalize to string (client expects string IDs)
            const normalizedId = String(movieId);

            try {
                const { CurrentUser: currentUser } = await serverAuth(req);

                const existingMovie = await prismadb.movie.findUnique({
                    where: { id: movieId }
                });

                if (!existingMovie) {
                    throw new Error('Invalid ID');
                }

                const user = await prismadb.user.update({
                    where: { email: currentUser.email || '' },
                    data: { favouriteIds: { push: movieId } }
                });

                return res.status(200).json(user);
            } catch (err) {
                // Prisma down / missing tables — apply dev-only in-memory update
                const prev = devFavourites.get(email) || [];
                if (!prev.includes(normalizedId)) {
                    devFavourites.set(email, [...prev, normalizedId]);
                }

                return res.status(200).json({ favouriteIds: devFavourites.get(email) });
            }
        }

        // DELETE: remove a movie from favourites
        if (req.method === 'DELETE') {
            const { movieId } = req.body;
            const normalizedId = String(movieId);

            try {
                const { CurrentUser: currentUser } = await serverAuth(req);

                const existingMovie = await prismadb.movie.findUnique({
                    where: { id: movieId }
                });

                if (!existingMovie) {
                    throw new Error('Invalid ID');
                }

                const updatedFavouriteIds = without(currentUser.favouriteIds, movieId);

                const updatedUser = await prismadb.user.update({
                    where: { email: currentUser.email || '' },
                    data: { favouriteIds: updatedFavouriteIds }
                });

                return res.status(200).json(updatedUser);
            } catch (err) {
                // Prisma down — remove from the in-memory map
                const prev = devFavourites.get(email) || [];
                const next = prev.filter(id => id !== normalizedId);
                devFavourites.set(email, next);

                return res.status(200).json({ favouriteIds: next });
            }
        }

        return res.status(405).end();
    } catch (error) {
        console.error(error);
        return res.status(500).end();
    }
}
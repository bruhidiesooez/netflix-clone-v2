import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "@/lib/prismadb";
import { moviesData } from '@/lib/moviesData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if(req.method !== 'GET') {
		return res.status(405).end();
	}

	// Keep the endpoint responsive even if Prisma/DB is slow or unavailable.
	// We'll race the DB query against a short timeout and fall back to the
	// bundled sample data if the DB doesn't respond quickly or throws.
	const DB_TIMEOUT_MS = 800; // small timeout so the UI remains snappy

	try {
		const dbPromise = prismadb.movie.findMany();
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error('DB_TIMEOUT')), DB_TIMEOUT_MS)
		);

		let movies;
		try {
			movies = await Promise.race([dbPromise, timeoutPromise]) as any[];
		} catch (err) {
			// Avoid noisy full-stack logs when the DB/table is missing.
			const DEBUG = process.env.DEBUG === 'true';
			if (DEBUG) {
				console.error('[MOVIES_API_ERROR] DB fetch failed or timed out]', err);
			} else {
				console.warn('[MOVIES_API_ERROR] DB fetch failed or timed out] ', (err as Error)?.message ?? err);
			}
			// Return fallback sample data when DB is slow/unavailable.
			return res.status(200).json(moviesData);
		}

		// If we got a result from the DB but it's empty, fall back to sample data
		// so the UI doesn't appear empty during early development.
		if (!movies || (Array.isArray(movies) && movies.length === 0)) {
			return res.status(200).json(moviesData);
		}

		return res.status(200).json(movies);
	} catch (error) {
		const DEBUG = process.env.DEBUG === 'true';
		if (DEBUG) {
			console.error('[MOVIES_API_ERROR]', error);
		} else {
			console.warn('[MOVIES_API_ERROR]', (error as Error)?.message ?? error);
		}
		return res.status(200).json(moviesData);
	}
}
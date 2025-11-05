import React, { useMemo } from 'react';

import { isEmpty } from 'lodash'
import MovieCard from './MovieCard';

interface MovieListProps {
    data : Record<string, any>[];
    title : string;
}

const MovieList: React.FC<MovieListProps> = ({ data, title }) => {
    if (isEmpty(data)) {
        return null;
    }
    // Ensure we only render each movie once — dedupe by id in case the
    // source array contains duplicates (DB or mock data merges).
    const uniqueMovies = Array.from(new Map(data.map((m) => [m.id, m])).values());

    // Show a single row only: pick a random subset of movies to display so
    // the UI doesn't render all items or create a scrollable list. Adjust
    // VISIBLE_COUNT to control how many tiles appear in the row.
    const VISIBLE_COUNT = 6;

    const visibleMovies = useMemo(() => {
        const arr = [...uniqueMovies];
        // Fisher-Yates shuffle
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, Math.min(arr.length, VISIBLE_COUNT));
    }, [uniqueMovies]);

    return (
        <div className='px-4 md:px-12 mt-4 space-y-8'>
            <div>
                <p className='relative z-0 text-white text-md md:text-xl lg:text-2xl font-semibold mb-4'>
                    {title}
                </p>
                {/* Render a single non-scrollable row (grid with fixed columns). */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                    {visibleMovies.map((movie) => (
                        <div key={movie.id} className='relative overflow-visible'>
                            <MovieCard data={movie} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MovieList;
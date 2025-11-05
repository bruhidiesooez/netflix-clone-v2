import React from "react";

import { BsFillPlayFill } from "react-icons/bs";
import FavouriteButton from "./FavouriteButton";

interface MovieCardProps {
    data: Record<string, any>;
}

const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
    return (
    // Use a fixed height (with a larger md height) instead of vw units so
    // thumbnails render reliably inside the non-scrollable grid layout.
    // Remove the min-width so the grid controls column widths instead of
    // forcing awkward widths that can hide images.
    <div className="group bg-zinc-900 relative h-44 md:h-48 overflow-visible">
            {/* Base thumbnail: wrap the <img> in an overflow-hidden container so
                the image is clipped to the card area and doesn't spill out when
                other transforms/overlays run. */}
            <div className="w-full h-44 md:h-48 overflow-hidden rounded-md shadow-xl transition duration-200 ease-in-out group-hover:opacity-0 z-10">
                <img
                    className="block w-full h-full object-cover"
                    src={data.thumbnailUrl || '/images/default-blue.png'}
                    alt={data.title || 'Movie thumbnail'}
                    loading="lazy"
                    data-testid={`movie-thumb-${data.id}`}
                />
            </div>

            {/* Hover overlay that expands the card and overlaps neighbors */}
            <div
                className="absolute top-0 left-0 w-full scale-100 opacity-0 transform-gpu transition duration-200 origin-left group-hover:scale-105 group-hover:-translate-y-1 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none group-hover:z-50 z-0"
            >
                <img
                    className="cursor-pointer object-cover transition duration-200 shadow-xl rounded-t-md w-full h-44 md:h-48"
                    src={data.thumbnailUrl || '/images/default-blue.png'}
                    alt={data.title || 'Movie thumbnail'}
                    loading="lazy"
                />

                <div className="z-50 bg-zinc-800 p-2 lg:p-3 w-full transition shadow-md rounded-b-md">
                    <div className="flex flex-row items-center gap-2">
                        <div
                            className="cursor-pointer w-5 h-5 lg:w-7 lg:h-7 bg-white rounded-full flex justify-center items-center hover:bg-neutral-300"
                            onClick={() => { }}
                        >
                            <BsFillPlayFill size={18} color="black" />
                        </div>
                        <FavouriteButton movieId={data?.id} />
                    </div>

                    <p className="text-green-400 font-semibold mt-2">
                        New <span className="text-green-500">2023</span>
                    </p>

                    <div className="flex flex-row mt-2 gap-2 items-center">
                        <p className="text-white text-[10px] lg:text-sm">{data.duration}</p>
                    </div>
                    <div className="flex flex-row mt-2 gap-2 items-center">
                        <p className="text-white text-[10px] lg:text-sm">{data.genre}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
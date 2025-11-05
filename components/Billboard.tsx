import useBillBoard from "@/hooks/useBillBoard";
import React from "react";
import { moviesData } from '@/lib/moviesData';

import { AiOutlineInfoCircle } from "react-icons/ai";

const Billboard = () => {
    const  { data } = useBillBoard();

    // Debug: show SWR result in browser console to help diagnose why the
    // billboard might be empty for some users.
    // eslint-disable-next-line no-console
    console.log('Billboard data:', data);

    // Use the fetched data when available; otherwise fall back to the first
    // bundled sample movie so the billboard always has content during
    // development and troubleshooting.
    const movie = data ?? moviesData[0];

    // Do not use a hardcoded video. Prefer an explicit HD source when available
    // (data.hdVideoUrl -> data.videoUrl). Fall back to the poster when no
    // video source is present. For dev we add hdVideoUrl entries in
    // `lib/moviesData.ts` so this will autoplay HD-like content locally.
    const videoSrc = movie?.hdVideoUrl || movie?.videoUrl || undefined;
    const posterSrc = movie?.thumbnailUrl || undefined;

    return (
    // Use responsive viewport-based heights so the billboard is smaller on
    // wide desktop screens and remains proportionate on mobile. Add a bottom
    // margin so any absolutely-positioned overlay doesn't overlap content
    // that follows (e.g., the Trending row).
    // Make the billboard taller and add extra bottom spacing so the
    // following content (Trending row) sits well below the overlay.
    <div className="relative h-[55vh] md:h-[65vh] lg:h-[70vh] mb-2 md:mb-8 lg:mb-12">
            {/* Video or poster */}
            {videoSrc ? (
                <video
                    className ="w-full h-full object-cover transition"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={posterSrc}
                    src={videoSrc}
                />
            ) : (
                <div
                    className="w-full h-full bg-center bg-cover"
                    style={{ backgroundImage: posterSrc ? `url(${posterSrc})` : undefined }}
                />
            )}

            {/* Gradient overlay to match Netflix-style hero (stronger near the bottom) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/95 pointer-events-none" />

            {/* Left-aligned content as before: title, description, and buttons placed
                on the left side with spacing so Trending doesn't overlap. */}
                <div className="absolute top-[24%] md:top-[34%] ml-4 md:ml-16 w-[60%] lg:w-[50%] text-left z-50">
                <p
                        className="relative z-60 text-white text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] truncate"
                    title={movie?.title}
                >
                    {movie?.title}
                </p>
                    <p className="relative z-50 text-white text-sm md:text-base mt-3 md:mt-5 leading-tight drop-shadow-xl md:px-0 max-h-28 overflow-hidden">
                    {movie?.description}
                </p>

                <div className="flex items-center gap-4 mt-6">
                    <button
                        className="flex items-center gap-2 bg-white bg-opacity-30 text-white rounded-md py-1 md:py-2 px-2 md:px-4 w-auto text-xs lg:text-lg font-semibold hover:bg-opacity-20 transition"
                        onClick={() => { /* TODO: show more info modal */ }}
                    >
                        <AiOutlineInfoCircle size={18} />
                        More Info
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Billboard;

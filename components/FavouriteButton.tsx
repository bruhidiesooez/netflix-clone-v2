import axios from 'axios';
import React, { useCallback, useMemo } from 'react';
import { AiOutlineCheck, AiOutlinePlus } from 'react-icons/ai';

import useCurrentUser from '@/hooks/useCurrentUser';
import { signIn, useSession } from 'next-auth/react';
import useFavourites from '@/hooks/useFavourites';

interface FavouriteButtonProps {
    movieId: string;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ movieId }) => {
    const { mutate: mutateFavourites } = useFavourites();
    const { data: currentUser, mutate } = useCurrentUser();

    const isFavourite = useMemo(() => {
        const list = currentUser?.favouriteIds || [];

        return list.includes(movieId);
    },[currentUser, movieId])

    const { data: session, status } = useSession();

    const toggleFavourite = useCallback(async () => {
        // If session is still loading, do nothing (avoid redirect). If unauthenticated,
        // trigger sign-in. This prevents accidental redirects while the client
        // is still fetching session data.
        if (status === 'loading') {
            return;
        }

        if (!session) {
            signIn();
            return;
        }
        try {
            let response;

            if (isFavourite) {
                response = await axios.delete('/api/favourites', { data: { movieId } } as any);
            } else {
                response = await axios.post('/api/favourites', { movieId });
            }

            const updatedFavouriteIds = (response?.data as { favouriteIds?: string[] } | undefined)?.favouriteIds;

            // Update current user if available
            if (mutate && currentUser) {
                mutate({
                    ...currentUser,
                    favouriteIds: updatedFavouriteIds,
                });
            }

            // Refresh favourites list
            mutateFavourites();
        } catch (err) {
            // If the API failed (DB down, missing tables, or auth issue), avoid crashing the app.
            // Log and apply a local optimistic update so the UI stays responsive.
            console.warn('Favourite toggle failed, applying local optimistic update', err);

            if (mutate && currentUser) {
                const currentIds = currentUser.favouriteIds || [];
                const nextIds = isFavourite
                    ? currentIds.filter((id: string) => id !== movieId)
                    : [...currentIds, movieId];

                // Update local cache without revalidation
                mutate({
                    ...currentUser,
                    favouriteIds: nextIds,
                }, false);
            }

            mutateFavourites();
        }
    }, [isFavourite, movieId, currentUser, mutate, mutateFavourites]);

    const Icon = isFavourite ? AiOutlineCheck : AiOutlinePlus

    return (
        <div
        onClick={toggleFavourite}
        className="
        cursor-pointer
        group/item
        w-5
        h-5
        lg:w-7
        lg:h-7
        border-white
        border-2
        rounded-full
        flex
        justify-center
        items-center
        hover:border-neutral-300
        transition
        ">
            <Icon className="text-white" size={18} />
        </div>
    )
}

export default FavouriteButton;
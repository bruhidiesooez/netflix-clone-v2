import useSWR from "swr";
import fetcher from '@/lib/fetcher';
import { useMemo } from 'react';

const useMovieList = () => {
    const { data, error, isLoading} = useSWR<Record<string, any>[]>('/api/movies', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    // Ensure the returned array is deduplicated by `id`. This helps when the
    // API or mock data accidentally contains duplicates and prevents duplicate
    // rendering in multiple components.
    const deduped = useMemo(() => {
        if (!data || !Array.isArray(data)) return data;
        return Array.from(new Map(data.map((m: any) => [m.id, m])).values());
    }, [data]);

    return {
        data: deduped,
        error,
        isLoading,
    }
};

export default useMovieList;

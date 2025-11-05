import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  year: number;
  rating: string;
  featured: boolean;
}

const MoviesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const genres = ['All', 'Animation', 'Action', 'Adventure', 'Comedy', 'Documentary', 'Drama', 'Fantasy', 'Sci-Fi'];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth');
      return;
    }

    fetchMovies();
  }, [session, status, router, selectedGenre]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/movies?genre=${selectedGenre}`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const playMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closePlayer = () => {
    setSelectedMovie(null);
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full max-w-6xl max-h-[80vh] bg-black">
            <button
              onClick={closePlayer}
              className="absolute top-4 right-4 z-10 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Close
            </button>
            <video
              src={selectedMovie.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h1 className="text-white text-2xl font-bold mb-2">{selectedMovie.title}</h1>
              <p className="text-gray-300 text-sm mb-2">{selectedMovie.description}</p>
              <div className="flex gap-4 text-gray-400 text-sm">
                <span>{selectedMovie.year}</span>
                <span>{selectedMovie.rating}</span>
                <span>{selectedMovie.duration}</span>
                <span>{selectedMovie.genre}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 px-4 md:px-12">
        <h1 className="text-white text-3xl md:text-4xl font-bold mb-8">Movies</h1>
        
        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded transition ${
                selectedGenre === genre
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-white text-center">Loading movies...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer transition duration-200 transform hover:scale-105"
                onClick={() => playMovie(movie)}
              >
                <div className="relative">
                  <img
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-full h-[300px] object-cover rounded-md shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition duration-200 rounded-md flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-white rounded-full p-3">
                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-white font-semibold truncate">{movie.title}</h3>
                  <div className="flex justify-between items-center text-gray-400 text-sm mt-1">
                    <span>{movie.year}</span>
                    <span>{movie.duration}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{movie.genre}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
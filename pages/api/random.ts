import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }
    try {
        await serverAuth(req); 

        const movieCount = await prismadb.movie.count();
        const randomIndex = Math.floor(Math.random() * movieCount);    
        const movies = await prismadb.movie.findMany();

        const randomMovies = await prismadb.movie.findMany({
            take: 1,
            skip: randomIndex,
        });

        return res.status(200).json(randomMovies[0]); 
    } catch (error) {
        console.error(error);
        return res.status(400).end();
    }
}

export default handler;
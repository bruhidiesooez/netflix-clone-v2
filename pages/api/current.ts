import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/lib/ServerAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    try {
        const { CurrentUser } = await serverAuth(req);

        return res.status(200).json(CurrentUser);
    } catch (error) {
        console.error(error);
        return res.status(400).end();
    }
}
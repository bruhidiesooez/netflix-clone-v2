import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";

import prismadb from "./prismadb";

const serverAuth = async (req: NextApiRequest) => {
    const session = await getSession({ req });

    if (!session?.user?.email) {
        throw new Error("Not Signed In");
    }

    const CurrentUser = await prismadb.user.findUnique({
        where: {
            email: session.user.email,
        }
    });

    if (!CurrentUser) {
        throw new Error("Not Signed In");
    }

    return { CurrentUser };   
};

export default serverAuth;
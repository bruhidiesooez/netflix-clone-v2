import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

// Temporarily commented out until database is working
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import prismadb from "@/lib/prismadb";

export default NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || ''
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        }),
        // Temporarily disable credentials provider until database is working
        /*
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email:{
                    label: "Email",
                    type: "text",
                },
                password:{
                    label: "Password",
                    type: "password",
                },
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error("Invalid Credentials");
                }

                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if(!user || !user.hashedPassword){
                    throw new Error("Invalid Credentials");
                }

                const isCorrectPassword = await compare(
                    credentials.password, 
                    user.hashedPassword
                );

                if(!isCorrectPassword){
                    throw new Error("Invalid Credentials");
                }

                return user;
            }
        })
        */
    ],
    pages:{
        signIn: "/auth",
    },
    debug: process.env.NODE_ENV === "development",
    // Temporarily disable Prisma adapter until database is working
    // adapter: PrismaAdapter(prismadb),
    callbacks: {
        async signIn({ user, account, profile }) {
            // Temporarily allow all OAuth sign-ins without database checks
            return true;
        },
        async session({ session, token }) {
            // Add user ID to session from JWT token
            if (token?.sub && session?.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            // Store user info in JWT token
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    session:{
        strategy: "jwt",
    },
    jwt:{
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
});
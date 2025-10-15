import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";


import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prismadb from "@/lib/prismadb";

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
                let user
                try {
                    user = await prismadb.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });
                } catch (error) {
                    console.error("Error fetching user in authorize:", error);
                    throw new Error("Internal Server Error");
                }
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
        
    ],
    pages:{
        signIn: "/auth",
    },
    debug: process.env.NODE_ENV === "development",

    adapter: PrismaAdapter(prismadb),
    callbacks: {
        async signIn({ user, account, profile }) {
 
            return true;
        },
        async session({ session, token }) {
           
            if (token?.sub && session?.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async jwt({ token, user, account }) {
 
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
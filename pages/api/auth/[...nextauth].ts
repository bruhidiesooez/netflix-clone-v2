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
            // support both GOOGLE_ID (existing .env) and GOOGLE_CLIENT_ID
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID || '',
            // support both common secret names
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET || ''
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
    ],
    pages:{
        signIn: "/auth",
    },
    debug: process.env.NODE_ENV === "development",
    adapter: PrismaAdapter(prismadb),
    callbacks: {
        // Automatically link OAuth accounts to an existing user with the same verified email.
        // This prevents the OAuthAccountNotLinked error when a user signs in with a different
        // provider but the same email address.
        async signIn({ user, account, profile, email }) {
            try {
                // Only attempt linking for OAuth providers with an email
                const provider = account?.provider;
                const providerAccountId = account?.providerAccountId;
                // NextAuth may provide email in different shapes; handle common ones
                const emailValue = (email && (email as any).email) || (profile && (profile as any).email) || null;

                if (!provider || !providerAccountId || !emailValue) return true;

                // If an account already exists for this provider/providerAccountId, allow sign in
                const existingAccount = await prismadb.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: provider,
                            providerAccountId: String(providerAccountId),
                        },
                    },
                });
                if (existingAccount) return true;

                // Find a user with the same email
                const existingUser = await prismadb.user.findUnique({ where: { email: emailValue } });
                if (existingUser) {
                    // Link the new OAuth account to the existing user
                    await prismadb.account.create({
                        data: {
                            userId: existingUser.id,
                            type: account.type || 'oauth',
                            provider: provider,
                            providerAccountId: String(providerAccountId),
                            access_token: account.access_token,
                            expires_at: account.expires_at ? Number(account.expires_at) : null,
                            refresh_token: account.refresh_token,
                            scope: account.scope,
                            token_type: account.token_type,
                            id_token: account.id_token,
                        },
                    });
                    return true;
                }
            } catch (err) {
                // If something goes wrong, do not block sign-in; let NextAuth handle it.
                console.error('Error in signIn callback linking accounts:', err);
                return false;
            }

            return true;
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
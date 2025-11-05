import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

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
                console.log("🔍 Authorize called with:", { email: credentials?.email, hasPassword: !!credentials?.password });
                
                if(!credentials?.email || !credentials?.password){
                    console.log("❌ Missing email or password");
                    return null;
                }
                
                // Temporary hardcoded test user for testing
                if ((credentials.email === "test68@gmail.com" || credentials.email === "test1@gmail.com") && credentials.password === "sdfaafd") {
                    console.log("✅ Test user authenticated successfully!");
                    const testUser = {
                        id: "test-user-123",
                        email: credentials.email,
                        name: "Test User",
                    };
                    console.log("🔍 Returning test user:", testUser);
                    return testUser;
                }
                
                console.log("❌ Invalid credentials");
                return null;
            }
        })
        
    ],
    pages:{
        signIn: "/auth",
    },
    debug: true,
    callbacks: {
    async jwt({ token, user }: any) {
            console.log("🔄 JWT callback:", { hasToken: !!token, hasUser: !!user, userEmail: user?.email });
            if (user) {
                token.id = user.id;
                token.email = user.email;
                console.log("✅ JWT: Adding user to token");
            }
            return token;
        },
    async session({ session, token }: any) {
            console.log("🔄 Session callback:", { hasSession: !!session, hasToken: !!token, tokenEmail: token?.email });
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                };
                console.log("✅ Session: Added token data to session");
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

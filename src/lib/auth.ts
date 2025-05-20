import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { database } from "./database";
import bcrypt from "bcrypt";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.email || credentials?.password) {
          throw new Error("Invalid credentials");
        }
        try {
              const user = await database.user.findFirst({
                where: {
                  email: credentials?.email,
                },
              });
              if (!user) {
                throw new Error("User not found");
              }
              const isPasswordValid = await bcrypt.compare(
                credentials!.password,
                user.password
              );
              if (!isPasswordValid) {
                throw new Error("Invalid password");
              }
              return {
                id: user.id.toString(),
                email: user.email,
                role: user.role,
              };

        } catch {
          throw new Error("Auth Error");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
export default authOptions;

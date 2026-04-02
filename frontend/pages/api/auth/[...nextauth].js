import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (!response.data?.success || !response.data?.data?.token) {
            throw new Error("Invalid login credentials.");
          }

          const { user, token } = response.data.data;

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            token,
          };
        } catch (Error) {
          throw new Error("Authentication failed. Please check your credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.createdAt = user.createdAt;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
        createdAt: token.createdAt,
        token: token.token,
      };
      return session;
    },
  },
  pages: {
    breaksignIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default function auth(req, res) {
  return NextAuth(req, res, authOptions);
}

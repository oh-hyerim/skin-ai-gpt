import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/lib/env";

const handler = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        token.provider = "google";
      }
      return token;
    },
    async session({ session, token }) {
      session.provider = token.provider;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 외부 도메인 방지 + callbackUrl 보존
      try {
        const target = new URL(url, baseUrl);
        if (target.origin === baseUrl) return target.toString();
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
});

export { handler as GET, handler as POST };



import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;
        token.uid = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? token.sub ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).provider = (token.provider as string) ?? "";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      // Fire-and-forget: persist user profile to MongoDB via backend
      if (account?.providerAccountId && account?.provider) {
        fetch(`${BACKEND_URL}/api/v2/users/sync-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": process.env.AUTH_SECRET || "",
          },
          body: JSON.stringify({
            userId: account.providerAccountId,
            provider: account.provider,
            name: user.name || null,
            email: user.email || null,
            image: user.image || null,
          }),
        }).catch(() => {
          // Silently fail — never block login for profile sync
        });
      }
    },
  },
});

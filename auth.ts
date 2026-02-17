import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

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
});

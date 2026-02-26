import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Effective date: February 26, 2026
      </p>

      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        StreamSeek and Trovie (&quot;we&quot;, &quot;our&quot;, or
        &quot;us&quot;) are movie and TV show discovery platforms operated by
        Sameer Sitre. StreamSeek is the web application available at{" "}
        <a
          href="https://streamseek.sameersitre.dev"
          className="text-accent hover:underline"
        >
          streamseek.sameersitre.dev
        </a>
        , and Trovie is the mobile application available on the Google Play
        Store. This Privacy Policy explains how we collect, use, and protect
        your information when you use either platform (collectively, the
        &quot;Service&quot;).
      </p>
      <p className="mb-6 text-sm leading-relaxed text-zinc-300">
        By using StreamSeek or Trovie, you agree to the collection and use of
        information as described in this policy.
      </p>

      {/* Information We Collect */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        1. Information We Collect
      </h2>

      <h3 className="mt-6 mb-2 text-base font-medium text-zinc-200">
        Account Information
      </h3>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        When you sign in using Google or GitHub, we receive the following
        information from your OAuth provider:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>Name</li>
        <li>Email address</li>
        <li>Profile picture URL</li>
        <li>OAuth provider identifier</li>
      </ul>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        We do not access your OAuth provider password or any data beyond what is
        listed above. On the Trovie mobile app, Google Sign-In is used; on the
        StreamSeek website, both Google and GitHub sign-in are available.
      </p>

      <h3 className="mt-6 mb-2 text-base font-medium text-zinc-200">
        User Activity Data
      </h3>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        When you interact with the Service, we store:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>Movies and TV shows you have liked</li>
        <li>Movies and TV shows you have added to your watchlist</li>
        <li>Timestamps of these interactions</li>
      </ul>

      <h3 className="mt-6 mb-2 text-base font-medium text-zinc-200">
        Technical Data
      </h3>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        We automatically collect limited technical data for security and
        operational purposes:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>IP address (used for rate limiting and abuse prevention)</li>
        <li>Browser or app type and version</li>
        <li>Device type and operating system</li>
        <li>Pages visited and search queries entered within the Service</li>
      </ul>

      {/* How We Use Your Information */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        2. How We Use Your Information
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        We use the information we collect for the following purposes:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>
          <strong className="text-zinc-200">Authentication</strong> — To sign
          you in and maintain your session across StreamSeek and Trovie
        </li>
        <li>
          <strong className="text-zinc-200">App functionality</strong> — To
          store and display your watchlist and liked items
        </li>
        <li>
          <strong className="text-zinc-200">Profile display</strong> — To show
          your name and avatar within the app
        </li>
        <li>
          <strong className="text-zinc-200">Security</strong> — Rate limiting,
          fraud prevention, and abuse detection
        </li>
        <li>
          <strong className="text-zinc-200">Improvements</strong> — To
          understand usage patterns and improve the Service
        </li>
      </ul>

      {/* Third-Party Services */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        3. Third-Party Services
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        StreamSeek and Trovie integrate with the following third-party services.
        Each service has its own privacy policy governing its use of data:
      </p>

      <ul className="mb-4 list-disc space-y-2 pl-6 text-sm text-zinc-300">
        <li>
          <strong className="text-zinc-200">Google OAuth</strong> — Used for
          sign-in on both StreamSeek and Trovie. Google receives your
          authentication request. You can revoke access at any time via your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Google Account settings
          </a>
          .{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Google Privacy Policy
          </a>
        </li>
        <li>
          <strong className="text-zinc-200">GitHub OAuth</strong> — Used for
          sign-in on StreamSeek (web only). GitHub receives your authorization
          request. You can revoke access via your{" "}
          <a
            href="https://github.com/settings/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            GitHub settings
          </a>
          .{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            GitHub Privacy Statement
          </a>
        </li>
        <li>
          <strong className="text-zinc-200">TMDB (The Movie Database)</strong>{" "}
          — We use the TMDB API to retrieve movie and TV show information
          (titles, posters, ratings, cast). Search queries and media IDs are
          sent to TMDB but are not tied to your personal identity. This product
          uses the TMDB API but is not endorsed or certified by TMDB.{" "}
          <a
            href="https://www.themoviedb.org/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            TMDB Privacy Policy
          </a>
        </li>
        <li>
          <strong className="text-zinc-200">Watchmode</strong> — We use the
          Watchmode API to show streaming platform availability. Media
          identifiers are sent to Watchmode but no personal data is transmitted.{" "}
          <a
            href="https://api.watchmode.com/tc/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Watchmode Terms
          </a>
        </li>
      </ul>

      {/* Cookies and Session Data */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        4. Cookies and Session Data
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        We use cookies and session tokens solely for authentication:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>
          <strong className="text-zinc-200">Session cookie</strong>{" "}
          (StreamSeek web) — A secure, encrypted JWT token that keeps you signed
          in. It contains your user ID, name, email, and profile picture. It
          does not contain your password or OAuth credentials.
        </li>
        <li>
          <strong className="text-zinc-200">Authentication token</strong>{" "}
          (Trovie mobile) — A Google ID token used to authenticate API requests.
          The token is validated server-side and is not stored permanently on our
          servers.
        </li>
        <li>
          <strong className="text-zinc-200">Local storage</strong> — We store
          your display preferences (such as selected genres) locally on your
          device. This data never leaves your device.
        </li>
      </ul>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        We do not use advertising cookies, tracking pixels, or analytics
        cookies. You can clear cookies at any time through your browser or
        device settings.
      </p>

      {/* Data Sharing */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        5. Data Sharing
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        We do <strong className="text-zinc-200">not</strong> sell, rent, or
        trade your personal data. We do not share your data for advertising
        purposes.
      </p>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        We may disclose your information only in the following limited
        circumstances:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>When required by law, regulation, or legal process</li>
        <li>
          To protect the rights, safety, or property of our users or the public
        </li>
        <li>
          With service providers who help us operate the Service (e.g., cloud
          hosting), under strict data protection obligations
        </li>
      </ul>

      {/* Data Security */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        6. Data Security
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        We take reasonable measures to protect your data, including:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>All data is transmitted over HTTPS (TLS encryption)</li>
        <li>Session tokens are encrypted (JWE) and signed</li>
        <li>Rate limiting is applied to prevent abuse</li>
        <li>Security headers are enforced via Helmet</li>
        <li>Database access is restricted and authenticated</li>
      </ul>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        No method of transmission over the internet is 100% secure. While we
        strive to protect your information, we cannot guarantee absolute
        security.
      </p>

      {/* Data Retention */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        7. Data Retention
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        Your account information and interaction data (likes, watchlist) are
        retained for as long as your account is active. If you wish to have your
        data deleted, please contact us at the email address below and we will
        remove your data within 30 days.
      </p>

      {/* Children's Privacy */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        8. Children&apos;s Privacy
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        StreamSeek and Trovie are not directed at children under the age of 13.
        We do not knowingly collect personal information from children under 13.
        If we become aware that a child under 13 has provided us with personal
        information, we will take steps to delete it promptly. If you are a
        parent or guardian and believe your child has provided us with personal
        data, please contact us.
      </p>

      {/* Your Rights */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        9. Your Rights
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        Depending on your location, you may have the following rights regarding
        your personal data:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>
          <strong className="text-zinc-200">Access</strong> — Request a copy of
          the data we hold about you
        </li>
        <li>
          <strong className="text-zinc-200">Correction</strong> — Request
          correction of inaccurate data (profile data is synced from your OAuth
          provider)
        </li>
        <li>
          <strong className="text-zinc-200">Deletion</strong> — Request
          deletion of your account and associated data
        </li>
        <li>
          <strong className="text-zinc-200">Objection</strong> — Object to
          certain types of data processing
        </li>
      </ul>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        To exercise any of these rights, please contact us at{" "}
        <a
          href="mailto:sameersitre@gmail.com"
          className="text-accent hover:underline"
        >
          sameersitre@gmail.com
        </a>
        . We will respond within 30 days.
      </p>

      {/* Changes to This Policy */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        10. Changes to This Policy
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        We may update this Privacy Policy from time to time. When we do, we will
        revise the &quot;Effective date&quot; at the top of this page. We
        encourage you to review this page periodically for the latest
        information. Continued use of the Service after changes constitutes
        acceptance of the updated policy.
      </p>

      {/* Contact Us */}
      <h2 className="mt-10 mb-4 text-xl font-semibold text-white">
        11. Contact Us
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        If you have any questions about this Privacy Policy or your personal
        data, please contact us:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-zinc-300">
        <li>
          <strong className="text-zinc-200">Developer:</strong> Sameer Sitre
        </li>
        <li>
          <strong className="text-zinc-200">Email:</strong>{" "}
          <a
            href="mailto:sameersitre@gmail.com"
            className="text-accent hover:underline"
          >
            sameersitre@gmail.com
          </a>
        </li>
      </ul>

      {/* Back to home */}
      <div className="mt-12 border-t border-white/10 pt-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          &larr; Back to StreamSeek
        </Link>
      </div>
    </div>
  );
}

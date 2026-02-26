"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { apiClient } from "@/app/services/apiClient";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const isValid = email.length >= 6 && message.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setStatus("sending");
    try {
      await apiClient.feedback({ email, message });
      setStatus("sent");
      setEmail("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="mt-16 border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 sm:grid-cols-2">
        {/* Feedback Form */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white">Feedback</h3>
          <p className="mb-4 text-xs text-zinc-500">
            This app is experimental. Share your thoughts or report issues.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
            <Textarea
              placeholder="Your message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-white/10 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
            />
            <Button
              type="submit"
              disabled={!isValid || status === "sending"}
              className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-50 sm:w-auto"
              size="sm"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="mr-1.5 h-3 w-3" />
              {status === "sending"
                ? "Sending..."
                : status === "sent"
                  ? "Sent!"
                  : status === "error"
                    ? "Failed — try again"
                    : "Send Feedback"}
            </Button>
          </form>
        </div>

        {/* Links */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white">Links</h3>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/sameersitre/bingefeast"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/sameersitre/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
              LinkedIn
            </a>
            <Link
              href="/privacy"
              className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
              Privacy Policy
            </Link>
          </div>

          <Separator className="my-4 bg-white/10" />

          <p className="text-xs text-zinc-600">
            Powered by TMDB. Built with Next.js, TanStack Query, and shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
}

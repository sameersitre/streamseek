"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  const handleSignIn = (provider: "google" | "github") => {
    setLoading(provider);
    signIn(provider);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setLoading(null);
        onOpenChange(v);
      }}
    >
      <DialogContent className="border-white/10 bg-zinc-900 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            Sign in to StreamSeek
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full border-white/10 bg-zinc-800 text-white hover:bg-zinc-700"
            disabled={loading !== null}
            onClick={() => handleSignIn("google")}
          >
            <FontAwesomeIcon
              icon={loading === "google" ? faSpinner : faGoogle}
              className="mr-2 h-4 w-4"
              spin={loading === "google"}
            />
            {loading === "google" ? "Redirecting..." : "Continue with Google"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-white/10 bg-zinc-800 text-white hover:bg-zinc-700"
            disabled={loading !== null}
            onClick={() => handleSignIn("github")}
          >
            <FontAwesomeIcon
              icon={loading === "github" ? faSpinner : faGithub}
              className="mr-2 h-4 w-4"
              spin={loading === "github"}
            />
            {loading === "github" ? "Redirecting..." : "Continue with GitHub"}
          </Button>
        </div>

        <p className="pt-2 text-center text-xs text-zinc-500">
          By signing in, you agree to our terms of use.
        </p>
      </DialogContent>
    </Dialog>
  );
}

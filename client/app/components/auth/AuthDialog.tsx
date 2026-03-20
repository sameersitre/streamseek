"use client";

import { useState, useMemo, useCallback } from "react";
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

  const handleSignIn = useCallback((provider: "google" | "github") => {
    setLoading(provider);
    signIn(provider);
  }, []);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) setLoading(null);
      onOpenChange(v);
    },
    [onOpenChange]
  );

  const buttons = useMemo(
    () => [
      { provider: "google" as const, label: "Google", icon: faGoogle },
      { provider: "github" as const, label: "GitHub", icon: faGithub },
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-900 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            Sign in to StreamSeek
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {buttons.map(({ provider, label, icon }) => (
            <Button
              key={provider}
              variant="outline"
              className="w-full border-white/10 bg-zinc-800 text-white hover:bg-zinc-700"
              disabled={loading !== null}
              onClick={() => handleSignIn(provider)}
            >
              <FontAwesomeIcon
                icon={loading === provider ? faSpinner : icon}
                className="mr-2 h-4 w-4"
                spin={loading === provider}
              />
              {loading === provider ? "Redirecting..." : `Continue with ${label}`}
            </Button>
          ))}
        </div>

        <p className="pt-2 text-center text-xs text-zinc-500">
          By signing in, you agree to our terms of use.
        </p>
      </DialogContent>
    </Dialog>
  );
}

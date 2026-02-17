"use client";

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

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => signIn("google")}
          >
            <FontAwesomeIcon icon={faGoogle} className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full border-white/10 bg-zinc-800 text-white hover:bg-zinc-700"
            onClick={() => signIn("github")}
          >
            <FontAwesomeIcon icon={faGithub} className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </div>

        <p className="pt-2 text-center text-xs text-zinc-500">
          By signing in, you agree to our terms of use.
        </p>
      </DialogContent>
    </Dialog>
  );
}

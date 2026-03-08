"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { loginWithOAuth } from "../actions";
import { GoogleIcon } from "./GoogleIcon";

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);
    await loginWithOAuth(window.location.origin);
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <GoogleIcon className="mr-2 size-4" />
      Continue with Google
    </Button>
  );
}

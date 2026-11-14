"use client";

import AnimatedCharactersLoginPage from "@/components/ui/animated-characters-login-page";

export default function RegisterCard({ message, error }: { message?: string; error?: string }) {
  return <AnimatedCharactersLoginPage mode="register" message={message} error={error} />;
}
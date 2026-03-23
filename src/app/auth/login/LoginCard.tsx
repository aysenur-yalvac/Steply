"use client";

import AnimatedCharactersLoginPage from "@/components/ui/animated-characters-login-page";

export default function LoginCard({ message }: { message?: string }) {
  return <AnimatedCharactersLoginPage mode="login" message={message} />;
}

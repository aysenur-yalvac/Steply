"use client";

import AnimatedCharactersLoginPage from "@/components/ui/animated-characters-login-page";

export default function RegisterCard({ message }: { message?: string }) {
  return <AnimatedCharactersLoginPage mode="register" message={message} />;
}

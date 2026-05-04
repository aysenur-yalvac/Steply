"use client";

import AnimatedCharactersLoginPage from "@/components/ui/animated-characters-login-page";

export default function LoginCard({ message, linkAccount, ownerId }: { message?: string; linkAccount?: boolean; ownerId?: string }) {
  return <AnimatedCharactersLoginPage mode="login" message={message} linkAccount={linkAccount} ownerId={ownerId} />;
}

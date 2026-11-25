"use client";

import AnimatedCharactersLoginPage from "@/components/ui/animated-characters-login-page";

export default function LoginCard({
  message,
  linkAccount,
  ownerId,
  initialEmail,
}: {
  message?: string;
  linkAccount?: boolean;
  ownerId?: string;
  initialEmail?: string;
}) {
  return (
    <AnimatedCharactersLoginPage
      mode="login"
      message={message}
      linkAccount={linkAccount}
      ownerId={ownerId}
      initialEmail={initialEmail}
    />
  );
}

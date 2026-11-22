import LoginCard from "./LoginCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; link_account?: string; owner_id?: string }>;
}) {
  const resolved = await searchParams;
  let displayMessage = resolved?.message;
  if (resolved?.error === "invalid_token") {
    displayMessage = "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.";
  } else if (resolved?.error === "oauth_failed") {
    displayMessage = "Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin.";
  } else if (!displayMessage && resolved?.error) {
    displayMessage = resolved.error;
  }

  return (
    <LoginCard
      message={displayMessage}
      linkAccount={resolved?.link_account === "true"}
      ownerId={resolved?.owner_id}
    />
  );
}
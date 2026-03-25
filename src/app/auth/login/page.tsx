import LoginCard from "./LoginCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const resolved = await searchParams;
  const displayMessage =
    resolved?.error === "invalid_token"
      ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin."
      : resolved?.message;

  return <LoginCard message={displayMessage} />;
}

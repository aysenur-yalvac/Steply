import RegisterCard from "./RegisterCard";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const resolved = await searchParams;
  let displayMessage = resolved?.message;

  if (resolved?.error === "account_not_found") {
    displayMessage = "Bu Google hesabıyla kayıtlı bir üyelik bulunamadı. Lütfen önce yeni hesap oluşturun.";
  } else if (resolved?.error) {
    displayMessage = resolved.error;
  }

  return <RegisterCard message={displayMessage} error={resolved?.error} />;
}
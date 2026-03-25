import RegisterCard from "./RegisterCard";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolved = await searchParams;
  const displayMessage = resolved?.message;

  return <RegisterCard message={displayMessage} />;
}

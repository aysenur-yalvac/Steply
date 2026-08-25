const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/auth/verify-email/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const oldExport = `export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;

  if (!email) {
    redirect("/auth/register");
  }

  return (
    <div`;

const newExport = `export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; role?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;
  const role = params.role || "student";

  if (!email) {
    redirect("/auth/register");
  }

  return (
    <div`;

content = content.replace(oldExport, newExport);
content = content.replace(/<OtpInput email=\{decodeURIComponent\(email\)\} \/>/, `<OtpInput email={decodeURIComponent(email)} role={role} />`);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated VerifyEmailPage.");

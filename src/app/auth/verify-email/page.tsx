import { Suspense } from "react";
import { redirect } from "next/navigation";
import OtpInput from "@/components/auth/OtpInput";

// Page receives ?email=... from query params after registration
export default async function VerifyEmailPage({
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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0B0E14" }}
    >
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute top-0 left-0 w-[700px] h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(160,32,240,0.18) 0%, transparent 58%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse at 100% 100%, rgba(124,58,255,0.12) 0%, transparent 58%)",
          }}
        />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Suspense fallback={null}>
          <OtpInput email={decodeURIComponent(email)} role={role} />
        </Suspense>
      </div>
    </div>
  );
}

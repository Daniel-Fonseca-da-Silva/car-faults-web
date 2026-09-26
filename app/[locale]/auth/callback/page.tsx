import { redirect } from "next/navigation";

interface AuthCallbackPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string; state?: string }>;
}

export default async function AuthCallbackPage({
  params,
  searchParams,
}: AuthCallbackPageProps) {
  const { locale } = await params;
  const { code, state } = await searchParams;

  if (!code || !state) {
    redirect(`/${locale}/login`);
  }

  redirect(
    `/api/auth/session?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&locale=${locale}`
  );
}

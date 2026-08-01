import { redirect } from "next/navigation";

interface AuthCallbackPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function AuthCallbackPage({
  params,
  searchParams,
}: AuthCallbackPageProps) {
  const { locale } = await params;
  const { code } = await searchParams;

  if (!code) {
    redirect(`/${locale}/login`);
  }

  redirect(
    `/api/auth/session?code=${encodeURIComponent(code)}&locale=${locale}`
  );
}

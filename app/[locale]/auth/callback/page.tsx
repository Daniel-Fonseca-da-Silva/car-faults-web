import { redirect } from "next/navigation";

interface AuthCallbackPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function AuthCallbackPage({
  params,
  searchParams,
}: AuthCallbackPageProps) {
  const { locale } = await params;
  const { token } = await searchParams;

  if (!token) {
    redirect(`/${locale}/login`);
  }

  redirect(
    `/api/auth/session?token=${encodeURIComponent(token)}&locale=${locale}`
  );
}

import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin/require-admin-user";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Defense in depth: every admin page also calls requireAdminUser() and the API
// enforces AdminGuard, but gating the layout keeps a newly added page that
// forgets the check from being served to non-admins.
export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;

  if (!(await requireAdminUser())) {
    redirect(`/${locale}/login`);
  }

  return children;
}

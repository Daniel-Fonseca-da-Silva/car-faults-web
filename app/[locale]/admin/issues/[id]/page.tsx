import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { FixList } from "@/components/admin/fix-list";
import { KnownIssueDeleteButton } from "@/components/admin/known-issue-delete-button";
import { KnownIssueForm } from "@/components/admin/known-issue-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { getAdminKnownIssue } from "@/lib/api/admin-known-issues.server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AdminIssueDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: AdminIssueDetailPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.admin" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminIssueDetailPage({
  params,
}: AdminIssueDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!(await requireAdminUser())) {
    redirect(`/${locale}/login`);
  }

  const issue = await getAdminKnownIssue(id);
  if (!issue) {
    notFound();
  }

  const t = await getTranslations("admin");

  return (
    <SiteShell className="py-12 sm:py-16">
      <Link
        href={`/admin/vehicles/${issue.vehicleModelId}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {t("issueDetail.backToVehicle")}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {issue.title}
        </h1>
        <KnownIssueDeleteButton
          knownIssueId={issue.id}
          vehicleModelId={issue.vehicleModelId}
          issueTitle={issue.title}
        />
      </div>

      <div className="mt-6 max-w-2xl">
        <KnownIssueForm
          vehicleModelId={issue.vehicleModelId}
          knownIssue={issue}
        />
      </div>

      <div className="mt-10 max-w-2xl">
        <h2 className="text-xl font-semibold text-foreground">
          {t("issueDetail.fixesTitle")}
        </h2>
        <div className="mt-4">
          <FixList knownIssueId={issue.id} fixes={issue.fixes} />
        </div>
      </div>
    </SiteShell>
  );
}

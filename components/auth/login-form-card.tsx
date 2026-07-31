"use client";

import { useTranslations } from "next-intl";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function LoginFormCard() {
  const t = useTranslations("auth");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center px-4 py-16 sm:px-6 lg:px-10">
      <p className="text-sm font-semibold tracking-widest text-primary uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance lg:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8">
        <GoogleSignInButton />
      </div>
    </div>
  );
}

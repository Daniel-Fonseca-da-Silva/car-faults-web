"use client";

import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function LoginFormCard() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

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

      <FieldSeparator className="mt-6 mb-2">
        {t("orSeparator")}
      </FieldSeparator>

      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="login-email">{t("email.label")}</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Mail aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t("email.placeholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="login-password">
              {t("password.label")}
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Lock aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  aria-label={
                    showPassword ? t("password.hide") : t("password.show")
                  }
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("forgotPassword")}
            </a>
          </div>

          <Button type="submit" className="h-11 w-full gap-2">
            <LogIn aria-hidden="true" />
            {t("submit")}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <a href="#" className="font-medium text-primary hover:underline">
          {t("register")}
        </a>
      </p>
    </div>
  );
}

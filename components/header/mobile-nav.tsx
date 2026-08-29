"use client";

import { LogIn, LogOut, Menu, ShieldCheck, Star, Warehouse } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/auth/logout";
import { NAV_ITEMS } from "@/lib/nav-items";
import { getInitials } from "@/lib/utils";
import type { UserProfile } from "@/types/user";

type MobileNavProps = {
  user: UserProfile | null;
};

export function MobileNav({ user }: MobileNavProps) {
  const t = useTranslations("nav");
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label={t("menu")}
            className="h-11 w-11"
          />
        }
      >
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t("menu")}</SheetTitle>
        </SheetHeader>
        {!user && (
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
              />
            }
          >
            <LogIn aria-hidden="true" className="size-4" />
            {t("login")}
          </SheetClose>
        )}
        <nav aria-label={t("menu")} className="flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => (
            <SheetClose
              key={item}
              nativeButton={false}
              render={
                <Link
                  href={`/${item}`}
                  className="min-h-11 rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                />
              }
            >
              {t(item)}
            </SheetClose>
          ))}
        </nav>
        {user && (
          <div className="mt-auto border-t border-border">
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-4 hover:bg-muted"
                />
              }
            >
              <Avatar>
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {user.name.split(" ")[0]}
              </span>
            </SheetClose>
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/garage"
                  className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-foreground hover:bg-muted"
                />
              }
            >
              <Warehouse aria-hidden="true" className="size-4" />
              {t("garage")}
            </SheetClose>
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-foreground hover:bg-muted"
                />
              }
            >
              <Star aria-hidden="true" className="size-4" />
              {t("favorites")}
            </SheetClose>
            {user.role === "admin" && (
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-foreground hover:bg-muted"
                  />
                }
              >
                <ShieldCheck aria-hidden="true" className="size-4" />
                {t("admin")}
              </SheetClose>
            )}
            <SheetClose
              render={
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-4 text-sm text-destructive hover:bg-muted"
                />
              }
            >
              <LogOut aria-hidden="true" className="size-4" />
              {t("logout")}
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

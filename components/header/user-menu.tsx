"use client";

import { LogIn, LogOut, ShieldCheck, User, Warehouse } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/auth/logout";
import { getInitials } from "@/lib/utils";
import type { UserProfile } from "@/types/user";

type UserMenuProps = {
  user: UserProfile | null;
};

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations("nav");
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  if (!user) {
    return (
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        variant="outline"
        className="gap-2"
      >
        <LogIn aria-hidden="true" />
        {t("login")}
      </Button>
    );
  }

  const firstName = user.name.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("accountMenu", { name: firstName })}
        className="flex items-center gap-2 rounded-full border border-primary/60 py-1 pl-1 pr-3 transition-colors hover:bg-muted"
      >
        <Avatar title={t("avatarAlt", { name: firstName })}>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">{firstName}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem
          nativeButton={false}
          render={<Link href="/profile" />}
          className="cursor-pointer"
        >
          <User aria-hidden="true" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem
          nativeButton={false}
          render={<Link href="/garage" />}
          className="cursor-pointer"
        >
          <Warehouse aria-hidden="true" />
          {t("garage")}
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/admin" />}
            className="cursor-pointer"
          >
            <ShieldCheck aria-hidden="true" />
            {t("admin")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut aria-hidden="true" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

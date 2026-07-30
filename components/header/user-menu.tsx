"use client";

import { LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { getInitials } from "@/lib/utils";

type UserMenuProps = {
  name: string;
  avatarUrl: string | null;
};

export function UserMenu({ name, avatarUrl }: UserMenuProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const firstName = name.split(" ")[0];

  function handleLogout() {
    // Stub only: no session/JWT clearing until auth is wired.
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("accountMenu", { name: firstName })}
        className="flex items-center gap-2 rounded-full border border-primary/60 py-1 pl-1 pr-3 transition-colors hover:bg-muted"
      >
        <Avatar title={t("avatarAlt", { name: firstName })}>
          <AvatarImage src={avatarUrl ?? undefined} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
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

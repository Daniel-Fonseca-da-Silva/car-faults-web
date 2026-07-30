"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";

const NAV_ITEMS = ["recalls", "defects", "compare", "about"] as const;

export function MobileNav() {
  const t = useTranslations("nav");

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
        <div className="mt-auto flex items-center gap-2 border-t border-border px-4 py-4">
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">Ana</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

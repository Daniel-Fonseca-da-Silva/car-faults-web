"use client";

import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useRouter } from "@/i18n/navigation";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { EUROPEAN_VEHICLE_MAKES } from "@/lib/mocks/vehicle-makes";

const FUEL_OPTIONS = [
  "gasoline",
  "diesel",
  "electric",
  "gpl",
  "hybrid",
] as const;
const DOOR_OPTIONS = [2, 3, 4, 5] as const;
const ELECTRIC_ENGINE_SENTINEL = "electric";
// Base UI clears the input when the popup closes without a selected item.
// Keep free-text makes so unmatched brands can still be searched.
const COMBOBOX_INPUT_CLEAR_REASON = "input-clear";

interface VehicleSearchFormProps {
  isDatabaseUp: boolean;
}

export function VehicleSearchForm({ isDatabaseUp }: VehicleSearchFormProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const locale = useLocale();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");
  const [fuel, setFuel] = useState("");
  const [doors, setDoors] = useState("");
  const [showValidationError, setShowValidationError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [widgetResetSignal, setWidgetResetSignal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaptchaError, setShowCaptchaError] = useState(false);

  const isElectric = fuel === ELECTRIC_ENGINE_SENTINEL;
  const effectiveEngine = isElectric ? ELECTRIC_ENGINE_SENTINEL : engine.trim();
  const isFullSearch = Boolean(
    make.trim() && model.trim() && year.trim() && effectiveEngine && fuel
  );

  function resetWidget() {
    setTurnstileToken(null);
    setWidgetResetSignal((signal) => signal + 1);
  }

  async function submitFullSearch() {
    if (!turnstileToken) return;

    setIsSubmitting(true);
    setShowCaptchaError(false);

    try {
      const response = await fetch("/api/lookup/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: make.trim(),
          model: model.trim(),
          year: Number(year.trim()),
          engine: effectiveEngine,
          fuelType: fuel,
          doors: doors ? Number(doors) : null,
          language: mapLookupLanguage(locale),
          turnstileToken,
        }),
      });

      if (!response.ok) {
        setShowCaptchaError(true);
        resetWidget();
        return;
      }

      const { href } = (await response.json()) as { href: string };
      router.push(href);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!make.trim() && !model.trim()) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);

    if (isFullSearch) {
      void submitFullSearch();
      return;
    }

    const query: Record<string, string> = {};
    if (make.trim()) query.make = make.trim();
    if (model.trim()) query.model = model.trim();
    if (year.trim()) query.year = year.trim();
    if (effectiveEngine) query.engine = effectiveEngine;
    if (fuel) query.fuel = fuel;
    if (doors) query.doors = doors;

    router.push({ pathname: "/defects", query });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
        <Badge variant="secondary" className="gap-1.5">
          <span
            className={
              isDatabaseUp
                ? "size-1.5 rounded-full bg-emerald-500"
                : "size-1.5 rounded-full bg-destructive"
            }
            aria-hidden="true"
          />
          {isDatabaseUp ? t("statusActive") : t("statusInactive")}
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="vehicle-make">
                  {t("fields.make")}
                </FieldLabel>
                <Combobox
                  items={EUROPEAN_VEHICLE_MAKES}
                  value={EUROPEAN_VEHICLE_MAKES.includes(make) ? make : null}
                  onValueChange={(value) => {
                    if (value != null) {
                      setMake(value);
                    }
                  }}
                  inputValue={make}
                  onInputValueChange={(value, eventDetails) => {
                    if (eventDetails.reason === COMBOBOX_INPUT_CLEAR_REASON) {
                      return;
                    }
                    setMake(value);
                  }}
                >
                  <ComboboxInput
                    id="vehicle-make"
                    name="make"
                    placeholder={t("fields.makePlaceholder")}
                    className="h-11 w-full"
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>{t("fields.makeNoResults")}</ComboboxEmpty>
                    <ComboboxList>
                      <ComboboxCollection>
                        {(item: string) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxCollection>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>

              <Field>
                <FieldLabel htmlFor="vehicle-model">
                  {t("fields.model")}
                </FieldLabel>
                <Input
                  id="vehicle-model"
                  name="model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder={t("fields.modelPlaceholder")}
                  className="h-11"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="vehicle-year">
                  {t("fields.year")}
                </FieldLabel>
                <Input
                  id="vehicle-year"
                  name="year"
                  type="number"
                  inputMode="numeric"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  placeholder={t("fields.yearPlaceholder")}
                  className="h-11"
                />
              </Field>

              {!isElectric && (
                <Field>
                  <FieldLabel htmlFor="vehicle-engine">
                    {t("fields.engine")}
                  </FieldLabel>
                  <Input
                    id="vehicle-engine"
                    name="engine"
                    value={engine}
                    onChange={(event) => setEngine(event.target.value)}
                    placeholder={t("fields.enginePlaceholder")}
                    className="h-11"
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="vehicle-fuel">
                  {t("fields.fuel")}
                </FieldLabel>
                <NativeSelect
                  id="vehicle-fuel"
                  name="fuel"
                  value={fuel}
                  onChange={(event) => setFuel(event.target.value)}
                  className="h-11 [&_select]:h-11"
                >
                  <NativeSelectOption value="">
                    {t("fields.fuelPlaceholder")}
                  </NativeSelectOption>
                  {FUEL_OPTIONS.map((option) => (
                    <NativeSelectOption key={option} value={option}>
                      {t(`fuelOptions.${option}`)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel htmlFor="vehicle-doors">
                  {t("fields.doors")}
                </FieldLabel>
                <NativeSelect
                  id="vehicle-doors"
                  name="doors"
                  value={doors}
                  onChange={(event) => setDoors(event.target.value)}
                  className="h-11 [&_select]:h-11"
                >
                  <NativeSelectOption value="">
                    {t("fields.doorsPlaceholder")}
                  </NativeSelectOption>
                  {DOOR_OPTIONS.map((option) => (
                    <NativeSelectOption key={option} value={String(option)}>
                      {option}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            {showValidationError && (
              <FieldError>{t("validation")}</FieldError>
            )}

            {isFullSearch && (
              <TurnstileWidget
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                resetSignal={widgetResetSignal}
              />
            )}

            {showCaptchaError && <FieldError>{t("captchaError")}</FieldError>}

            <Button
              type="submit"
              className="h-11 w-full gap-2 sm:w-auto"
              disabled={isFullSearch && (!turnstileToken || isSubmitting)}
            >
              <Search aria-hidden="true" />
              {isSubmitting ? t("verifying") : t("submit")}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

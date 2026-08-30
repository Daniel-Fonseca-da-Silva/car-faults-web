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
import { Spinner } from "@/components/ui/spinner";
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
const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear() + 1;

function isYearInRange(value: string): boolean {
  const year = Number(value);
  return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
}
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
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [yearRangeError, setYearRangeError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [widgetResetSignal, setWidgetResetSignal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaptchaError, setShowCaptchaError] = useState(false);
  const [searchErrorKey, setSearchErrorKey] = useState<
    "searchError" | "searchUnavailable" | "searchInvalidCriteria" | null
  >(null);

  const isElectric = fuel === ELECTRIC_ENGINE_SENTINEL;
  const effectiveEngine = isElectric ? ELECTRIC_ENGINE_SENTINEL : engine.trim();
  const isFullSearch = Boolean(
    make.trim() && model.trim() && year.trim() && effectiveEngine && fuel
  );

  function resetWidget() {
    setTurnstileToken(null);
    setWidgetResetSignal((signal) => signal + 1);
  }

  function clearFieldError(field: string, value: string) {
    if (!value.trim()) return;
    setInvalidFields((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }

  async function submitFullSearch() {
    if (!turnstileToken) return;

    setIsSubmitting(true);
    setShowCaptchaError(false);
    setSearchErrorKey(null);

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
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (data?.error === "TURNSTILE_REQUIRED") {
          setShowCaptchaError(true);
          resetWidget();
        } else if (data?.error === "INVALID_CRITERIA") {
          setSearchErrorKey("searchInvalidCriteria");
        } else if (data?.error === "LOOKUP_UNAVAILABLE") {
          setSearchErrorKey("searchUnavailable");
        } else {
          setSearchErrorKey("searchError");
        }
        setIsSubmitting(false);
        return;
      }

      const { href } = (await response.json()) as { href: string };
      router.push(href);
    } catch {
      setSearchErrorKey("searchUnavailable");
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFullSearch) {
      const missing = new Set<string>();
      if (!make.trim()) missing.add("make");
      if (!model.trim()) missing.add("model");
      if (!year.trim()) missing.add("year");
      if (!fuel) missing.add("fuel");
      if (!isElectric && !engine.trim()) missing.add("engine");
      setInvalidFields(missing);
      setYearRangeError(false);
      return;
    }

    if (!isYearInRange(year.trim())) {
      setInvalidFields(new Set());
      setYearRangeError(true);
      return;
    }

    setInvalidFields(new Set());
    setYearRangeError(false);
    void submitFullSearch();
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
              <Field data-invalid={invalidFields.has("make")}>
                <FieldLabel htmlFor="vehicle-make" required>
                  {t("fields.make")}
                </FieldLabel>
                <Combobox
                  items={EUROPEAN_VEHICLE_MAKES}
                  value={EUROPEAN_VEHICLE_MAKES.includes(make) ? make : null}
                  onValueChange={(value) => {
                    if (value != null) {
                      setMake(value);
                      clearFieldError("make", value);
                    }
                  }}
                  inputValue={make}
                  onInputValueChange={(value, eventDetails) => {
                    if (eventDetails.reason === COMBOBOX_INPUT_CLEAR_REASON) {
                      return;
                    }
                    setMake(value);
                    clearFieldError("make", value);
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
                {invalidFields.has("make") && (
                  <FieldError>{t("errors.required")}</FieldError>
                )}
              </Field>

              <Field data-invalid={invalidFields.has("model")}>
                <FieldLabel htmlFor="vehicle-model" required>
                  {t("fields.model")}
                </FieldLabel>
                <Input
                  id="vehicle-model"
                  name="model"
                  value={model}
                  onChange={(event) => {
                    setModel(event.target.value);
                    clearFieldError("model", event.target.value);
                  }}
                  placeholder={t("fields.modelPlaceholder")}
                  className="h-11"
                />
                {invalidFields.has("model") && (
                  <FieldError>{t("errors.required")}</FieldError>
                )}
              </Field>

              <Field
                data-invalid={invalidFields.has("year") || yearRangeError}
              >
                <FieldLabel htmlFor="vehicle-year" required>
                  {t("fields.year")}
                </FieldLabel>
                <Input
                  id="vehicle-year"
                  name="year"
                  type="number"
                  inputMode="numeric"
                  value={year}
                  onChange={(event) => {
                    setYear(event.target.value);
                    clearFieldError("year", event.target.value);
                    setYearRangeError(false);
                  }}
                  placeholder={t("fields.yearPlaceholder")}
                  className="h-11"
                />
                {invalidFields.has("year") && (
                  <FieldError>{t("errors.required")}</FieldError>
                )}
                {yearRangeError && (
                  <FieldError>
                    {t("errors.yearRange", { min: MIN_YEAR, max: MAX_YEAR })}
                  </FieldError>
                )}
              </Field>

              {!isElectric && (
                <Field data-invalid={invalidFields.has("engine")}>
                  <FieldLabel htmlFor="vehicle-engine" required>
                    {t("fields.engine")}
                  </FieldLabel>
                  <Input
                    id="vehicle-engine"
                    name="engine"
                    value={engine}
                    onChange={(event) => {
                      setEngine(event.target.value);
                      clearFieldError("engine", event.target.value);
                    }}
                    placeholder={t("fields.enginePlaceholder")}
                    className="h-11"
                  />
                  {invalidFields.has("engine") && (
                    <FieldError>{t("errors.required")}</FieldError>
                  )}
                </Field>
              )}

              <Field data-invalid={invalidFields.has("fuel")}>
                <FieldLabel htmlFor="vehicle-fuel" required>
                  {t("fields.fuel")}
                </FieldLabel>
                <NativeSelect
                  id="vehicle-fuel"
                  name="fuel"
                  value={fuel}
                  onChange={(event) => {
                    setFuel(event.target.value);
                    clearFieldError("fuel", event.target.value);
                  }}
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
                {invalidFields.has("fuel") && (
                  <FieldError>{t("errors.required")}</FieldError>
                )}
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

            {isFullSearch && (
              <TurnstileWidget
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setShowCaptchaError(false);
                }}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                resetSignal={widgetResetSignal}
              />
            )}

            {showCaptchaError && <FieldError>{t("captchaError")}</FieldError>}
            {searchErrorKey && <FieldError>{t(searchErrorKey)}</FieldError>}

            <Button
              type="submit"
              className="h-11 w-full gap-2 sm:w-auto"
              disabled={isFullSearch && (!turnstileToken || isSubmitting)}
            >
              {isSubmitting ? (
                <Spinner aria-hidden="true" />
              ) : (
                <Search aria-hidden="true" />
              )}
              {isSubmitting ? t("verifying") : t("submit")}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

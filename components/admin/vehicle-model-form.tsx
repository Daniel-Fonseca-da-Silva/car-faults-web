"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  createAdminVehicleModel,
  updateAdminVehicleModel,
  type AdminVehicleModelInput,
} from "@/lib/api/admin-vehicles";
import { uploadVehicleImage } from "@/lib/api/storage";
import { useRouter } from "@/i18n/navigation";
import { EUROPEAN_VEHICLE_MAKES } from "@/lib/mocks/vehicle-makes";
import type { AdminVehicleModel } from "@/types/admin";
import type { LookupFuelType } from "@/types/lookup";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
// Base UI clears the input when the popup closes without a selected item.
// Keep free-text brands so makes outside EUROPEAN_VEHICLE_MAKES stay usable.
const COMBOBOX_INPUT_CLEAR_REASON = "input-clear";
const FUEL_TYPE_LABEL_KEYS = {
  gasoline: "vehicleForm.fuelTypeGasoline",
  diesel: "vehicleForm.fuelTypeDiesel",
  electric: "vehicleForm.fuelTypeElectric",
  gpl: "vehicleForm.fuelTypeGpl",
  hybrid: "vehicleForm.fuelTypeHybrid",
} as const satisfies Record<LookupFuelType, string>;

const FUEL_TYPES = Object.keys(FUEL_TYPE_LABEL_KEYS) as LookupFuelType[];

interface VehicleModelFormProps {
  vehicle?: AdminVehicleModel;
}

export function VehicleModelForm({ vehicle }: VehicleModelFormProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(vehicle);

  const [brand, setBrand] = useState(vehicle?.brand ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [name, setName] = useState(vehicle?.name ?? "");
  const [yearFrom, setYearFrom] = useState(
    vehicle ? String(vehicle.yearFrom) : ""
  );
  const [yearTo, setYearTo] = useState(
    vehicle?.yearTo != null ? String(vehicle.yearTo) : ""
  );
  const [engine, setEngine] = useState(vehicle?.engine ?? "");
  const [doors, setDoors] = useState(
    vehicle?.doors != null ? String(vehicle.doors) : ""
  );
  const [fuelType, setFuelType] = useState<LookupFuelType | "">(
    vehicle?.fuelType ?? ""
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    vehicle?.imageUrl ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadSucceeded, setUploadSucceeded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleRemoveImage() {
    setImageUrl(null);
    setImageError(null);
    setUploadSucceeded(false);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageError(null);
    setUploadSucceeded(false);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError(t("vehicleForm.invalidImageType"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError(t("vehicleForm.imageTooLarge"));
      return;
    }

    setUploading(true);
    try {
      const result = await uploadVehicleImage(file);
      setImageUrl(result.url);
      setUploadSucceeded(true);
    } catch {
      setImageError(t("common.error"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const input: AdminVehicleModelInput = {
      brand: brand.trim(),
      model: model.trim(),
      name: name.trim() ? name.trim() : null,
      yearFrom: Number(yearFrom),
      yearTo: yearTo.trim() ? Number(yearTo) : null,
      engine: engine.trim(),
      doors: doors.trim() ? Number(doors) : null,
      fuelType: fuelType || null,
      imageUrl,
    };

    try {
      const saved = vehicle
        ? await updateAdminVehicleModel(vehicle.id, input)
        : await createAdminVehicleModel(input);
      router.push(`/admin/vehicles/${saved.id}`);
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-brand">{t("vehicleForm.brand")}</Label>
          <Combobox
            items={EUROPEAN_VEHICLE_MAKES}
            value={EUROPEAN_VEHICLE_MAKES.includes(brand) ? brand : null}
            onValueChange={(value) => {
              if (value != null) setBrand(value);
            }}
            inputValue={brand}
            onInputValueChange={(value, eventDetails) => {
              if (eventDetails.reason === COMBOBOX_INPUT_CLEAR_REASON) {
                return;
              }
              setBrand(value);
            }}
          >
            <ComboboxInput
              id="vehicle-brand"
              name="brand"
              placeholder={t("vehicleForm.brandPlaceholder")}
              required
              disabled={submitting}
            />
            <ComboboxContent>
              <ComboboxEmpty>{t("vehicleForm.brandNoResults")}</ComboboxEmpty>
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
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-model">{t("vehicleForm.model")}</Label>
          <Input
            id="vehicle-model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="vehicle-name">{t("vehicleForm.name")}</Label>
          <Input
            id="vehicle-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-year-from">{t("vehicleForm.yearFrom")}</Label>
          <Input
            id="vehicle-year-from"
            type="number"
            value={yearFrom}
            onChange={(event) => setYearFrom(event.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-year-to">{t("vehicleForm.yearTo")}</Label>
          <Input
            id="vehicle-year-to"
            type="number"
            value={yearTo}
            onChange={(event) => setYearTo(event.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-engine">{t("vehicleForm.engine")}</Label>
          <Input
            id="vehicle-engine"
            value={engine}
            onChange={(event) => setEngine(event.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-doors">{t("vehicleForm.doors")}</Label>
          <Input
            id="vehicle-doors"
            type="number"
            value={doors}
            onChange={(event) => setDoors(event.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-fuel-type">{t("vehicleForm.fuelType")}</Label>
          <NativeSelect
            id="vehicle-fuel-type"
            value={fuelType}
            onChange={(event) =>
              setFuelType(event.target.value as LookupFuelType | "")
            }
            disabled={submitting}
          >
            <NativeSelectOption value="">
              {t("vehicleForm.fuelTypeNone")}
            </NativeSelectOption>
            {FUEL_TYPES.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {t(FUEL_TYPE_LABEL_KEYS[value])}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t("vehicleForm.image")}</Label>
        {imageUrl && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-32 w-auto rounded-lg border border-border object-cover"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting || uploading}
          >
            {uploading ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                {t("vehicleForm.uploading")}
              </>
            ) : (
              t("vehicleForm.uploadImage")
            )}
          </Button>
          {imageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              disabled={submitting || uploading}
            >
              {t("vehicleForm.removeImage")}
            </Button>
          )}
          {uploadSucceeded && !uploading && (
            <span
              role="status"
              aria-label={t("vehicleForm.uploadSucceeded")}
              className="text-success"
            >
              <CheckCircle2 aria-hidden="true" className="size-5" />
            </span>
          )}
        </div>
        {imageError && (
          <p role="alert" className="text-sm text-destructive">
            {imageError}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting
            ? isEditing
              ? t("common.saving")
              : t("common.creating")
            : isEditing
              ? t("common.save")
              : t("common.create")}
        </Button>
      </div>
    </form>
  );
}

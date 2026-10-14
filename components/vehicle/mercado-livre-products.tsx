import {
  BatteryCharging,
  CarFront,
  CloudRain,
  Droplet,
  Lightbulb,
  SprayCan,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type {
  MercadoLivreProduct,
  MercadoLivreProductId,
} from "@/lib/affiliate/mercado-livre";

const PRODUCT_ICONS: Record<MercadoLivreProductId, LucideIcon> = {
  steeringWheelCover: CarFront,
  lubricantSpray: SprayCan,
  engineOil: Droplet,
  battery: BatteryCharging,
  wipers: CloudRain,
  tools: Wrench,
  headlightBulbs: Lightbulb,
};

interface MercadoLivreProductsProps {
  products: MercadoLivreProduct[];
  title: string;
  subtitle: string;
  disclosure: string;
  labels: Record<MercadoLivreProductId, string>;
}

export function MercadoLivreProducts({
  products,
  title,
  subtitle,
  disclosure,
  labels,
}: MercadoLivreProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.map((product) => {
          const Icon = PRODUCT_ICONS[product.id];
          return (
            <li key={product.id}>
              <a
                href={product.url}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                {labels[product.id]}
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground/80">{disclosure}</p>
    </section>
  );
}

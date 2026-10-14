import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildFaqPageJsonLd, serializeJsonLd } from "@/lib/seo/json-ld";

const FAQ_KEYS = [
  "whatIs",
  "howToSearch",
  "sources",
  "mechanic",
  "severity",
  "account",
  "garageVsFavorites",
  "contribute",
] as const;

export async function FaqSection() {
  const t = await getTranslations("home.faq");

  const items = FAQ_KEYS.map((key) => ({
    key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));
  const faqJsonLd = buildFaqPageJsonLd(items);

  return (
    <section aria-labelledby="faq-title" className="mx-auto max-w-3xl py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <Reveal className="mb-10 text-center">
        <h2
          id="faq-title"
          className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {t("title")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <Accordion defaultValue={[FAQ_KEYS[0]]} className="gap-3">
          {items.map(({ key, question, answer }) => (
            <AccordionItem
              key={key}
              value={key}
              className="rounded-lg border bg-card px-4 transition-colors hover:bg-muted/40"
            >
              <AccordionTrigger className="py-4 font-semibold hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}

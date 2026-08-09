interface LegalDocumentSection {
  id: string;
  heading: string;
  body: string;
}

interface LegalDocumentProps {
  id: string;
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalDocumentSection[];
}

export function LegalDocument({
  id,
  title,
  effectiveDate,
  lastUpdated,
  sections,
}: LegalDocumentProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{effectiveDate}</p>
      <p className="text-sm text-muted-foreground">{lastUpdated}</p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <div key={section.id}>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {section.heading}
            </h3>
            <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
              {section.body.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

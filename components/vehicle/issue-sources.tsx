import { isHttpUrl } from "@/lib/sources/is-http-url";

interface IssueSourcesProps {
  sources: string[] | null | undefined;
  label: string;
  className?: string;
}

function sourceHostname(url: string): string {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function IssueSources({ sources, label, className }: IssueSourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <p className={className ?? "mt-2 text-xs text-muted-foreground"}>
      {label}:{" "}
      {sources.map((source, index) => (
        <span key={`${source}-${index}`}>
          {isHttpUrl(source) ? (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {sourceHostname(source)}
            </a>
          ) : (
            <span>{source}</span>
          )}
          {index < sources.length - 1 && ", "}
        </span>
      ))}
    </p>
  );
}

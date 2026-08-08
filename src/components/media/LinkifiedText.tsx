import { splitTextWithUrls } from "@/lib/media/external-links";

type LinkifiedTextProps = {
  text: string;
  className?: string;
};

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = splitTextWithUrls(text);

  return (
    <p className={className}>
      {parts.map((part, index) =>
        part.type === "url" ? (
          <a
            key={`${part.value}-${index}`}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary underline decoration-primary/30 underline-offset-2"
          >
            {part.value}
          </a>
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        )
      )}
    </p>
  );
}

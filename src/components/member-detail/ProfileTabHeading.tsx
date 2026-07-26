type ProfileTabHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function ProfileTabHeading({
  eyebrow,
  title,
  description,
}: ProfileTabHeadingProps) {
  return (
    <div className="mb-8 shrink-0 px-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-[28px] font-light tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}

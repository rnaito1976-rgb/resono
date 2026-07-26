import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClassName =
  "w-full rounded-2xl border border-border bg-white/[0.03] px-4 py-3.5 text-[16px] text-white outline-none transition-quiet placeholder:text-white/30 focus:border-primary/35 focus:ring-1 focus:ring-primary/15";

type FormSectionProps = {
  title: string;
  id?: string;
  children: React.ReactNode;
};

type FormGroupHeadingProps = {
  label: string;
};

export function FormGroupHeading({ label }: FormGroupHeadingProps) {
  return (
    <h2 className="border-b border-white/[0.08] pb-3 text-[22px] font-light tracking-tight text-foreground">
      {label}
    </h2>
  );
}

export function FormSection({ title, id, children }: FormSectionProps) {
  return (
    <section id={id} className="space-y-4">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] text-white/70">{label}</span>
      {children}
      {hint ? <span className="block text-[12px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function FormInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClassName} ${props.className ?? ""}`} />;
}

export function FormTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldClassName} min-h-[96px] resize-y ${props.className ?? ""}`}
    />
  );
}

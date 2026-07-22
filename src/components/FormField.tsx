import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/25";

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="space-y-4">
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

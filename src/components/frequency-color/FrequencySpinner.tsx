type FrequencySpinnerProps = {
  size?: number;
  className?: string;
};

export function FrequencySpinner({ size = 18, className = "" }: FrequencySpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-border border-t-primary ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

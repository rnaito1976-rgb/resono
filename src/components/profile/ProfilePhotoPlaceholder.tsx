import { cn } from "@/lib/utils";

type ProfilePhotoPlaceholderProps = {
  className?: string;
  label?: string;
};

export function ProfilePhotoPlaceholder({
  className,
  label = "No image",
}: ProfilePhotoPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-white/[0.06]",
        className
      )}
    >
      <span className="text-[14px] font-medium tracking-wide text-white/35">{label}</span>
    </div>
  );
}

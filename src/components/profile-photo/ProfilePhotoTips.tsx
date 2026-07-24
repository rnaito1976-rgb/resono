import { PHOTO_TIP_ITEMS } from "@/lib/profile-photo/constants";

export function ProfilePhotoTips() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5">
      <p className="mb-4 text-[14px] text-[#F6F6F6]/85">こんな写真がおすすめ</p>
      <ul className="space-y-3">
        {PHOTO_TIP_ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-white/55">
            <span className="mt-0.5 text-primary" aria-hidden>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

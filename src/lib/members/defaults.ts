import type { Member } from "@/types/member";

/** 一覧クエリで省略した JSON 列のデフォルト（⑫ select 最適化用） */
export const EMPTY_PORTRAIT: Member["portrait"] = {
  bio: "",
  age: 0,
  location: "",
  influences: [],
};

export const EMPTY_FASHION: Member["fashion"] = {
  style: "",
  colors: [],
  brands: [],
  description: "",
};

export const EMPTY_LOOKING_FOR: Member["lookingFor"] = {
  parts: [],
  bandVision: "",
  commitment: "",
};

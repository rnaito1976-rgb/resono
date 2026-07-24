import { MemberDetailFrame, type MemberDetailFrameProps } from "@/components/member-detail/MemberDetailFrame";

export type MemberDetailProps = MemberDetailFrameProps;

/** ② Server page から呼び出す薄いラッパー（データは SSR、操作UIのみ Client） */
export function MemberDetail(props: MemberDetailProps) {
  return <MemberDetailFrame {...props} />;
}

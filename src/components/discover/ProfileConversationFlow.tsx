"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/navigation/AppTopBar";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { Button } from "@/components/ui/button";
import { addProfileCardFromConversationAction } from "@/lib/actions/onboarding";
import {
  getPendingConversationSteps,
  type ProfileConversationStep,
} from "@/lib/profile/cards";
import type { Member } from "@/types/member";

type ProfileConversationFlowProps = {
  member: Member;
};

export function ProfileConversationFlow({ member }: ProfileConversationFlowProps) {
  const [answeredStepIds, setAnsweredStepIds] = useState<string[]>([]);
  const pendingSteps = useMemo(
    () =>
      getPendingConversationSteps(member).filter(
        (step) => !answeredStepIds.includes(step.id)
      ),
    [member, answeredStepIds]
  );
  const [completedCount, setCompletedCount] = useState(0);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stepIndex = Math.min(completedCount, Math.max(pendingSteps.length - 1, 0));
  const step = pendingSteps[stepIndex] as ProfileConversationStep | undefined;
  const isFinished = pendingSteps.length === 0 || completedCount >= pendingSteps.length;

  function handleSubmit() {
    if (!step || !answer.trim()) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await addProfileCardFromConversationAction(step.id, answer.trim());
      if (result.error) {
        setError(result.error);
        return;
      }

      setAnswer("");
      setAnsweredStepIds((current) => [...current, step.id]);
      setCompletedCount((current) => current + 1);
    });
  }

  if (isFinished) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-6">
        <AppTopBar backHref={`/member/${member.id}`} backLabel="プロフィールへ" />

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Profile Updated
          </p>
          <h1 className="mt-4 text-[28px] font-light tracking-tight text-white">
            新しいカードが追加されました
          </h1>
          <p className="mt-4 max-w-[28ch] text-[15px] leading-relaxed text-white/45">
            プロフィールは、会話を重ねるほど音楽人生のアルバムのように育っていきます。
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href={`/member/${member.id}`}>プロフィールを見る</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link href="/">ホームへ戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!step) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-6">
      <AppTopBar backHref={`/member/${member.id}`} backLabel="プロフィールへ" />

      <div className="mb-8 mt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          AI Conversation
        </p>
        <h1 className="mt-3 text-[28px] font-light tracking-tight text-white">
          プロフィールを育てる
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/45">
          質問に答えるたびに、Journal に新しいカードが追加されます。
        </p>
        <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-white/30">
          {completedCount + 1} / {pendingSteps.length}
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pb-6">
        <DialogueTurn message={step.message} active />
        <div className="pl-8">
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={step.placeholder}
            className="h-12 w-full rounded-full border border-border bg-white/[0.04] px-5 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-border"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button
          size="lg"
          className="w-full"
          disabled={!answer.trim() || isPending}
          onClick={handleSubmit}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <FrequencySpinner size={16} />
              カードを追加中...
            </span>
          ) : completedCount + 1 >= pendingSteps.length ? (
            "カードを追加して完了"
          ) : (
            "カードを追加して次へ"
          )}
        </Button>
      </div>
    </div>
  );
}

function DialogueTurn({
  message,
  active = false,
}: {
  message: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-medium text-primary">
        AI
      </div>
      <div
        className={`max-w-[82%] rounded-[22px] px-4 py-3 text-[15px] leading-relaxed ${
          active
            ? "border border-border bg-white/[0.05] text-white"
            : "bg-white/[0.03] text-white/55"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

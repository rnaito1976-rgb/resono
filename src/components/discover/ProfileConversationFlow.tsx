"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AppTopBar } from "@/components/navigation/AppTopBar";
import { ProfileGrowQuestionInput } from "@/components/discover/ProfileGrowQuestionInput";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { Button } from "@/components/ui/button";
import { useFocusScrollIntoView } from "@/hooks/useFocusScrollIntoView";
import { useVisualViewportHeight } from "@/hooks/useVisualViewportHeight";
import {
  getProfileGrowResonanceInsightAction,
  saveProfileGrowSessionAction,
} from "@/lib/actions/profile-grow";
import {
  createCandidatesFromSelection,
  extractFreeTextCandidates,
  formatSelectionSummary,
} from "@/lib/profile/grow/candidates";
import { dedupeProfileGrowCandidates } from "@/lib/profile/grow/extract";
import { pickRandomProfileGrowTheme } from "@/lib/profile/grow/themes";
import type { ProfileGrowCandidate, ProfileGrowResonanceInsight } from "@/types/profile-grow";
import type { Member } from "@/types/member";

const ProfileGrowReview = dynamic(
  () =>
    import("@/components/discover/ProfileGrowReview").then((module) => ({
      default: module.ProfileGrowReview,
    })),
  {
    loading: () => (
      <div className="flex flex-1 flex-col justify-center">
        <div className="h-8 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 h-24 animate-pulse rounded-[22px] bg-white/[0.04]" />
      </div>
    ),
  }
);

type ProfileConversationFlowProps = {
  memberId: string;
  initialMember?: Member;
};

type ChatTurn = {
  role: "ai" | "user";
  message: string;
};

type FlowStep = "chat" | "review" | "complete";

const QUESTIONS_PER_SESSION = 3;

export function ProfileConversationFlow({
  memberId,
  initialMember,
}: ProfileConversationFlowProps) {
  const [member, setMember] = useState<Member | null>(initialMember ?? null);
  const [session] = useState(() => {
    const theme = pickRandomProfileGrowTheme();
    return {
      theme,
      turns: [
        { role: "ai" as const, message: theme.opener },
        { role: "ai" as const, message: theme.questions[0].message },
      ],
    };
  });
  const theme = session.theme;
  const [flowStep, setFlowStep] = useState<FlowStep>("chat");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [freeText, setFreeText] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [turns, setTurns] = useState<ChatTurn[]>(session.turns);
  const [candidates, setCandidates] = useState<ProfileGrowCandidate[]>([]);
  const [resonance, setResonance] = useState<ProfileGrowResonanceInsight | null>(null);
  const [isResonanceLoading, setIsResonanceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const viewportHeight = useVisualViewportHeight();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLElement>(null);

  useFocusScrollIntoView(composerRef);

  useEffect(() => {
    if (initialMember) {
      setMember(initialMember);
    }
  }, [initialMember]);

  const currentQuestion = theme.questions[questionIndex];
  const isSelectQuestion = currentQuestion?.inputMode === "select";
  const progressLabel = `${Math.min(questionIndex + 1, QUESTIONS_PER_SESSION)} / ${QUESTIONS_PER_SESSION}`;

  // キーボードの開閉やアクセサリバーで数pxずれてもリスト高さが揺れないよう粗く丸める
  const quantizedViewportHeight = Math.round(viewportHeight / 80) * 80;

  const pickerListMaxHeight = useMemo(() => {
    if (!isSelectQuestion) {
      return undefined;
    }

    const reserved =
      quantizedViewportHeight > 0 ? quantizedViewportHeight * 0.32 : 220;
    return Math.max(140, Math.min(260, Math.round(reserved)));
  }, [isSelectQuestion, quantizedViewportHeight]);

  const canSubmit = isSelectQuestion
    ? selectedValues.length > 0
    : freeText.trim().length > 0;

  const reviewCandidates = useMemo(
    () => (member ? dedupeProfileGrowCandidates(candidates, member) : candidates),
    [candidates, member]
  );

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (typeof window === "undefined") {
      return;
    }

    // 入力中のスクロールは iOS でキーボードを閉じてしまうので触らない
    const active = document.activeElement;
    if (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement
    ) {
      return;
    }

    // ドキュメント全体をスクロールするので、末尾へ寄せると sticky な入力欄の直上に最新の質問が来る
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior,
    });
  }, []);

  useEffect(() => {
    scrollChatToBottom("auto");
  }, [turns, questionIndex, scrollChatToBottom]);

  function handleSubmitAnswer() {
    if (!currentQuestion || !canSubmit) {
      return;
    }

    setError(null);

    const extracted =
      currentQuestion.inputMode === "select"
        ? createCandidatesFromSelection(currentQuestion, selectedValues)
        : extractFreeTextCandidates(currentQuestion, freeText);

    const userMessage =
      currentQuestion.inputMode === "select"
        ? formatSelectionSummary(selectedValues)
        : freeText.trim();

    setCandidates((current) => [...current, ...extracted]);
    setTurns((current) => [...current, { role: "user", message: userMessage }]);

    const nextIndex = questionIndex + 1;
    setFreeText("");
    setSelectedValues([]);

    if (nextIndex >= QUESTIONS_PER_SESSION) {
      setFlowStep("review");
      return;
    }

    setQuestionIndex(nextIndex);
    setTurns((current) => [
      ...current,
      { role: "ai", message: theme.questions[nextIndex].message },
    ]);
  }

  function handleSave(nextCandidates: ProfileGrowCandidate[]) {
    setError(null);
    startTransition(async () => {
      const result = await saveProfileGrowSessionAction(nextCandidates);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.after) {
        setMember(result.after);
      }

      setFlowStep("complete");

      const beforeSnapshot = member;
      if (beforeSnapshot && result.after) {
        setIsResonanceLoading(true);
        void getProfileGrowResonanceInsightAction(beforeSnapshot, result.after)
          .then((insight) => setResonance(insight))
          .finally(() => setIsResonanceLoading(false));
      }
    });
  }

  if (flowStep === "complete") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-6">
        <AppTopBar backHref={`/member/${memberId}`} backLabel="プロフィールへ" />

        <div className="flex flex-1 flex-col justify-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Saved
          </p>
          <h1 className="mt-4 text-[28px] font-light tracking-tight text-white">
            プロフィールが育ちました
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/45">
            音楽の話をしていたら、自然とプロフィールが少し厚くなりました。
          </p>

          {isResonanceLoading ? (
            <div className="mt-8 rounded-[24px] border border-primary/20 bg-primary/5 px-5 py-5">
              <div className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
              <div className="mt-4 h-4 w-48 animate-pulse rounded-full bg-white/10" />
            </div>
          ) : resonance ? (
            <div className="mt-8 rounded-[24px] border border-primary/20 bg-primary/5 px-5 py-5">
              {resonance.score != null ? (
                <p className="text-[32px] font-light tabular-nums tracking-tight text-white">
                  {resonance.score}%
                </p>
              ) : null}
              {resonance.scoreDelta > 0 ? (
                <p className="mt-2 text-[14px] font-medium text-primary">
                  共鳴度が{resonance.scoreDelta}%アップしました
                </p>
              ) : (
                <p className="mt-2 text-[14px] font-medium text-primary">
                  新しい共鳴ポイントが見つかりました
                </p>
              )}
              {resonance.commonPoints.length > 0 ? (
                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
                    共鳴ポイント
                  </p>
                  {resonance.commonPoints.map((point) => (
                    <p
                      key={point}
                      className="flex items-start gap-2 text-[15px] leading-relaxed text-white/80"
                    >
                      <span className="text-primary" aria-hidden>
                        ✓
                      </span>
                      <span>{point}</span>
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href={`/member/${memberId}`}>プロフィールを見る</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link href="/discover">もう一度話す</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (flowStep === "review") {
    if (!member) {
      return (
        <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-6">
          <AppTopBar backHref={`/member/${memberId}`} backLabel="プロフィールへ" />
          <div className="flex flex-1 flex-col justify-center gap-4">
            <div className="h-8 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="h-24 animate-pulse rounded-[22px] bg-white/[0.04]" />
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-6">
        <AppTopBar backHref={`/member/${memberId}`} backLabel="プロフィールへ" />
        <ProfileGrowReview
          candidates={reviewCandidates}
          onSave={handleSave}
          onBack={() => setFlowStep("chat")}
          isSaving={isPending}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black">
      <div className="px-5 pt-6">
        <AppTopBar backHref={`/member/${memberId}`} backLabel="プロフィールへ" />

        <div className="mb-4 mt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Discover a Story
          </p>
          <h1 className="mt-3 text-[24px] font-light tracking-tight text-white sm:text-[28px]">
            プロフィールを育てる
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-white/45">
            今日のテーマは「{theme.label}」。雑談みたいに3問だけ話しましょう。
          </p>
          <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-white/30">
            {progressLabel}
          </p>
        </div>
      </div>

      <div ref={chatScrollRef} className="flex-1 px-5 pb-4">
        <div className="space-y-4">
          {turns.map((turn, index) => (
            <DialogueTurn
              key={`${turn.role}-${index}`}
              message={turn.message}
              isUser={turn.role === "user"}
            />
          ))}
          <div ref={chatEndRef} className="h-px shrink-0" aria-hidden />
        </div>
      </div>

      <footer
        ref={composerRef}
        className="sticky bottom-0 border-t border-border bg-black/95 px-5 pt-3 backdrop-blur-xl pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="space-y-3">
          {currentQuestion ? (
            <ProfileGrowQuestionInput
              question={currentQuestion}
              freeText={freeText}
              onFreeTextChange={setFreeText}
              selected={selectedValues}
              onSelectedChange={setSelectedValues}
              listMaxHeight={pickerListMaxHeight}
            />
          ) : null}
          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
          <Button
            size="lg"
            className="h-12 w-full touch-manipulation text-[16px]"
            disabled={!canSubmit || isPending}
            onClick={handleSubmitAnswer}
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <FrequencySpinner size={16} />
                送信中...
              </span>
            ) : questionIndex + 1 >= QUESTIONS_PER_SESSION ? (
              "回答して確認へ"
            ) : (
              "返信する"
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function DialogueTurn({
  message,
  isUser = false,
}: {
  message: string;
  isUser?: boolean;
}) {
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[22px] bg-primary/15 px-4 py-3 text-[15px] leading-relaxed text-white">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-medium text-primary">
        AI
      </div>
      <div className="max-w-[82%] px-1 py-1 text-[15px] leading-relaxed text-white/55">
        {message}
      </div>
    </div>
  );
}

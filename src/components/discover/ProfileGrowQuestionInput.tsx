"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { MOBILE_CHAT_TEXTAREA_CLASS } from "@/lib/mobile/input-classes";
import { cn } from "@/lib/utils";
import type { ProfileGrowQuestion } from "@/types/profile-grow";

const ProfileGrowSelectInput = dynamic(
  () =>
    import("@/components/discover/ProfileGrowSelectInput").then((module) => ({
      default: module.ProfileGrowSelectInput,
    })),
  {
    loading: () => (
      <div className="h-24 animate-pulse rounded-[22px] bg-white/[0.04]" aria-hidden />
    ),
  }
);

type ProfileGrowQuestionInputProps = {
  question: ProfileGrowQuestion;
  freeText: string;
  onFreeTextChange: (value: string) => void;
  selected: string[];
  onSelectedChange: (values: string[]) => void;
  listMaxHeight?: number;
};

export function ProfileGrowQuestionInput({
  question,
  freeText,
  onFreeTextChange,
  selected,
  onSelectedChange,
  listMaxHeight,
}: ProfileGrowQuestionInputProps) {
  if (question.inputMode === "free") {
    return (
      <ProfileGrowFreeTextInput value={freeText} onChange={onFreeTextChange} />
    );
  }

  return (
    <ProfileGrowSelectInput
      question={question}
      selected={selected}
      onSelectedChange={onSelectedChange}
      listMaxHeight={listMaxHeight}
    />
  );
}

function ProfileGrowFreeTextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 128)}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={1}
      placeholder="思いつくまま返信してみて"
      enterKeyHint="send"
      autoComplete="off"
      autoCorrect="on"
      className={cn(MOBILE_CHAT_TEXTAREA_CLASS)}
    />
  );
}

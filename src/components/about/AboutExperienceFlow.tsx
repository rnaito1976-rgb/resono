const STEPS = [
  {
    title: "好きな音楽を選ぶ",
    body: "アーティストやジャンル、パートを登録。好きな音楽からプロフィールができます。",
    preview: "Radiohead · ギター · オルタナティブ",
  },
  {
    title: "共鳴する人を見つける",
    body: "共鳴度と共鳴ポイントで、音楽的に合いそうな人が直感的に分かります。",
    preview: "共鳴度 87% · King Gnu · コピー",
  },
  {
    title: "話してみる",
    body: "気になった人に共鳴を送って、メッセージでバンドのイメージを話せます。",
    preview: "「一緒にコピーしてみたいです」",
  },
  {
    title: "バンドを始める",
    body: "共鳴した仲間とBandを作り、活動の記録を残していけます。",
    preview: "Timeline · Activity · Set List",
  },
] as const;

export function AboutExperienceFlow() {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Flow
        </p>
        <h2 className="text-[20px] font-medium tracking-tight text-foreground">
          RESONOで起きること
        </h2>
      </div>

      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-[22px] border border-border/80 bg-subtle/60 px-5 py-5"
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[13px] font-medium text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 space-y-2">
                <h3 className="text-[17px] font-medium tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-white/65">{step.body}</p>
                <p className="rounded-[14px] border border-border/60 bg-black/20 px-3 py-2 text-[13px] text-white/45">
                  {step.preview}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

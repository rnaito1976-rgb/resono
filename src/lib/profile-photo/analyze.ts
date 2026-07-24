import type { PhotoClarityLevel, PhotoClarityResult } from "@/lib/profile-photo/types";

type AnalysisMetrics = {
  brightness: number;
  contrast: number;
  sharpness: number;
  faceCoverage: number;
  backgroundNoise: number;
};

const LEVEL_LABELS: Record<PhotoClarityLevel, string> = {
  excellent: "Excellent",
  great: "Great",
  good: "Good",
  "needs-improvement": "Needs Improvement",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function measureMetrics(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  faceCoverage: number
): AnalysisMetrics {
  const { data } = ctx.getImageData(0, 0, width, height);
  let brightnessSum = 0;
  let brightnessSqSum = 0;
  let laplacianSum = 0;
  let edgeSamples = 0;
  let cornerEdgeSum = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      brightnessSum += lum;
      brightnessSqSum += lum * lum;

      if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
        const rightIndex = (y * width + (x + 2)) * 4;
        const downIndex = ((y + 2) * width + x) * 4;
        const rightLum =
          0.2126 * (data[rightIndex] ?? 0) +
          0.7152 * (data[rightIndex + 1] ?? 0) +
          0.0722 * (data[rightIndex + 2] ?? 0);
        const downLum =
          0.2126 * (data[downIndex] ?? 0) +
          0.7152 * (data[downIndex + 1] ?? 0) +
          0.0722 * (data[downIndex + 2] ?? 0);
        const laplacian = Math.abs(4 * lum - rightLum - downLum);
        laplacianSum += laplacian;

        const inCorner =
          (x < width * 0.2 || x > width * 0.8) &&
          (y < height * 0.2 || y > height * 0.8);
        if (inCorner) {
          cornerEdgeSum += laplacian;
          edgeSamples += 1;
        }
      }
    }
  }

  const samples = Math.ceil(width / 2) * Math.ceil(height / 2);
  const brightness = brightnessSum / samples / 255;
  const variance = brightnessSqSum / samples - (brightnessSum / samples) ** 2;
  const contrast = Math.sqrt(Math.max(variance, 0)) / 128;
  const sharpness = laplacianSum / samples / 255;
  const backgroundNoise =
    edgeSamples > 0 ? cornerEdgeSum / edgeSamples / 255 : 0;

  return {
    brightness,
    contrast: clamp(contrast, 0, 1),
    sharpness: clamp(sharpness, 0, 1),
    faceCoverage: clamp(faceCoverage, 0, 1),
    backgroundNoise: clamp(backgroundNoise, 0, 1),
  };
}

function buildTips(metrics: AnalysisMetrics): string[] {
  const tips: string[] = [];

  if (metrics.faceCoverage < 0.18) {
    tips.push("もう少し顔が大きく写ると伝わりやすくなります。");
  }

  if (metrics.brightness < 0.28) {
    tips.push("自然光の写真がおすすめです。");
  } else if (metrics.brightness > 0.82) {
    tips.push("少し明るさを抑えると、表情がより自然に見えます。");
  }

  if (metrics.backgroundNoise > 0.16) {
    tips.push("背景がシンプルだと印象が伝わりやすくなります。");
  }

  if (metrics.sharpness < 0.06) {
    tips.push("ピントが合った写真だと、あなたらしさがより伝わります。");
  }

  if (tips.length === 0) {
    tips.push("この写真は、あなたの世界観がよく伝わる一枚です。");
  }

  return tips.slice(0, 3);
}

function scoreMetrics(metrics: AnalysisMetrics): number {
  const brightnessScore =
    metrics.brightness >= 0.32 && metrics.brightness <= 0.72 ? 1 : 0.55;
  const faceScore = metrics.faceCoverage >= 0.22 ? 1 : metrics.faceCoverage / 0.22;
  const sharpnessScore = metrics.sharpness >= 0.08 ? 1 : metrics.sharpness / 0.08;
  const contrastScore = metrics.contrast >= 0.12 ? 1 : metrics.contrast / 0.12;
  const backgroundScore =
    metrics.backgroundNoise <= 0.14 ? 1 : 1 - (metrics.backgroundNoise - 0.14) / 0.3;

  return (
    faceScore * 0.35 +
    brightnessScore * 0.2 +
    sharpnessScore * 0.2 +
    contrastScore * 0.15 +
    backgroundScore * 0.1
  );
}

function levelFromScore(score: number): PhotoClarityLevel {
  if (score >= 0.86) return "excellent";
  if (score >= 0.72) return "great";
  if (score >= 0.55) return "good";
  return "needs-improvement";
}

/** Heuristic clarity analysis — replace with AI analyzer in future modules. */
export function analyzePhotoClarity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  faceCoverage: number
): PhotoClarityResult {
  const metrics = measureMetrics(ctx, width, height, faceCoverage);
  const level = levelFromScore(scoreMetrics(metrics));

  return {
    level,
    label: LEVEL_LABELS[level],
    tips: buildTips(metrics),
  };
}

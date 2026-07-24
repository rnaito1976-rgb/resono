import { analyzePhotoClarity } from "@/lib/profile-photo/analyze";
import { PROFILE_PHOTO_OUTPUT_SIZE } from "@/lib/profile-photo/constants";
import type { OptimizeProfilePhotoResult } from "@/lib/profile-photo/types";

type Point = { x: number; y: number };

type FaceDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<
    Array<{ boundingBox: { x: number; y: number; width: number; height: number } }>
  >;
};

async function detectFaceCenter(
  source: CanvasImageSource,
  width: number,
  height: number
): Promise<{ center: Point; coverage: number }> {
  const FaceDetectorCtor = (
    globalThis as typeof globalThis & {
      FaceDetector?: new (options?: { maxDetectedFaces?: number }) => FaceDetectorLike;
    }
  ).FaceDetector;

  if (FaceDetectorCtor && source instanceof HTMLCanvasElement) {
    try {
      const detector = new FaceDetectorCtor({ maxDetectedFaces: 1 });
      const faces = await detector.detect(source);

      if (faces[0]) {
        const box = faces[0].boundingBox;
        const center = {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        };
        const coverage = (box.width * box.height) / (width * height);
        return { center, coverage: Math.min(coverage * 2.4, 1) };
      }
    } catch {
      // Fall through to heuristic crop.
    }
  }

  return {
    center: { x: width * 0.5, y: height * 0.38 },
    coverage: 0.16,
  };
}

function estimateSaliencyCenter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Point {
  const { data } = ctx.getImageData(0, 0, width, height);
  let totalWeight = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const index = (y * width + x) * 4;
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
      const upperBias = y < height * 0.65 ? 1.15 : 0.85;
      const weight = (0.55 + saturation * 0.45) * (1 - Math.abs(lum - 0.52)) * upperBias;

      totalWeight += weight;
      sumX += x * weight;
      sumY += y * weight;
    }
  }

  if (totalWeight === 0) {
    return { x: width * 0.5, y: height * 0.38 };
  }

  return { x: sumX / totalWeight, y: sumY / totalWeight };
}

function getSquareCrop(
  width: number,
  height: number,
  center: Point
): { x: number; y: number; size: number } {
  const size = Math.min(width, height) * 0.92;
  const x = Math.max(0, Math.min(width - size, center.x - size / 2));
  const y = Math.max(0, Math.min(height - size, center.y - size / 2));

  return { x, y, size };
}

function applyNaturalAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    let r = (data[index] ?? 0) / 255;
    let g = (data[index + 1] ?? 0) / 255;
    let b = (data[index + 2] ?? 0) / 255;

    r = (r - 0.5) * 1.06 + 0.515;
    g = (g - 0.5) * 1.06 + 0.515;
    b = (b - 0.5) * 1.04 + 0.505;

    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const warmth = 1.015;
    r *= warmth;
    b *= 0.985;

    const satBoost = 1.04;
    r = lum + (r - lum) * satBoost;
    g = lum + (g - lum) * satBoost;
    b = lum + (b - lum) * satBoost;

    data[index] = Math.max(0, Math.min(255, Math.round(r * 255)));
    data[index + 1] = Math.max(0, Math.min(255, Math.round(g * 255)));
    data[index + 2] = Math.max(0, Math.min(255, Math.round(b * 255)));
  }

  ctx.putImageData(imageData, 0, 0);
}

function applySharpen(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const source = ctx.getImageData(0, 0, width, height);
  const output = ctx.createImageData(width, height);
  const kernel = [0, -0.08, 0, -0.08, 1.32, -0.08, 0, -0.08, 0];

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        let value = 0;
        let kernelIndex = 0;

        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            const sampleIndex = ((y + ky) * width + (x + kx)) * 4 + channel;
            value += (source.data[sampleIndex] ?? 0) * (kernel[kernelIndex] ?? 0);
            kernelIndex += 1;
          }
        }

        const targetIndex = (y * width + x) * 4 + channel;
        output.data[targetIndex] = Math.max(0, Math.min(255, Math.round(value)));
      }

      const alphaIndex = (y * width + x) * 4 + 3;
      output.data[alphaIndex] = source.data[alphaIndex] ?? 255;
    }
  }

  ctx.putImageData(output, 0, 0);
}

function applyBackgroundCalm(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.2,
    width / 2,
    height / 2,
    width * 0.72
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(10,10,10,0.16)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function optimizeProfilePhoto(file: File): Promise<OptimizeProfilePhotoResult> {
  const image = await loadImageFromFile(file);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;

  const sourceCtx = sourceCanvas.getContext("2d");
  if (!sourceCtx) {
    throw new Error("画像処理に失敗しました");
  }

  sourceCtx.drawImage(image, 0, 0);

  const faceDetection = await detectFaceCenter(
    sourceCanvas,
    sourceCanvas.width,
    sourceCanvas.height
  );
  const saliencyCenter = estimateSaliencyCenter(
    sourceCtx,
    sourceCanvas.width,
    sourceCanvas.height
  );
  const center = {
    x: faceDetection.center.x * 0.72 + saliencyCenter.x * 0.28,
    y: faceDetection.center.y * 0.72 + saliencyCenter.y * 0.28,
  };
  const crop = getSquareCrop(sourceCanvas.width, sourceCanvas.height, center);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = PROFILE_PHOTO_OUTPUT_SIZE;
  outputCanvas.height = PROFILE_PHOTO_OUTPUT_SIZE;

  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) {
    throw new Error("画像処理に失敗しました");
  }

  outputCtx.drawImage(
    sourceCanvas,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    PROFILE_PHOTO_OUTPUT_SIZE,
    PROFILE_PHOTO_OUTPUT_SIZE
  );

  applyNaturalAdjustments(outputCtx, PROFILE_PHOTO_OUTPUT_SIZE, PROFILE_PHOTO_OUTPUT_SIZE);
  applySharpen(outputCtx, PROFILE_PHOTO_OUTPUT_SIZE, PROFILE_PHOTO_OUTPUT_SIZE);
  applyBackgroundCalm(outputCtx, PROFILE_PHOTO_OUTPUT_SIZE, PROFILE_PHOTO_OUTPUT_SIZE);

  const clarity = analyzePhotoClarity(
    outputCtx,
    PROFILE_PHOTO_OUTPUT_SIZE,
    PROFILE_PHOTO_OUTPUT_SIZE,
    faceDetection.coverage
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("画像の書き出しに失敗しました"));
          return;
        }

        resolve(result);
      },
      "image/jpeg",
      0.9
    );
  });

  const previewUrl = URL.createObjectURL(blob);

  return {
    blob,
    previewUrl,
    clarity,
    optimization: {
      optimizedAt: new Date().toISOString(),
      crop: "square",
      analyzer: "heuristic-v1",
    },
  };
}

export function revokeOptimizedPreviewUrl(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

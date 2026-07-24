/** Extensible modules for future profile media features. */
export type ProfilePhotoModule =
  | "photo"
  | "video"
  | "ai-analysis"
  | "ai-picker"
  | "gallery";

export type PhotoClarityLevel =
  | "excellent"
  | "great"
  | "good"
  | "needs-improvement";

export type PhotoClarityResult = {
  level: PhotoClarityLevel;
  label: string;
  tips: string[];
};

export type ProfilePhotoOptimizationMeta = {
  optimizedAt: string;
  crop: "square";
  /** Hook for future AI analysis pipeline. */
  analyzer: "heuristic-v1";
};

export type ProfilePhotoAsset = {
  id: string;
  url: string;
  kind: "photo" | "video";
  isPrimary: boolean;
  clarity?: PhotoClarityResult;
  optimization?: ProfilePhotoOptimizationMeta;
};

export type OptimizeProfilePhotoResult = {
  blob: Blob;
  previewUrl: string;
  clarity: PhotoClarityResult;
  optimization: ProfilePhotoOptimizationMeta;
};

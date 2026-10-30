import type {
  AlchemyKind,
  ArchiveCategory,
  EnquiryStatus,
  EnquiryType,
  EventFormat,
  JournalCategory,
  MediaPermission,
  MediaStatus,
  ReleaseKind,
  ReleaseStage,
} from "./types";

export const releaseKindLabels: Record<ReleaseKind, string> = {
  album: "Album",
  ep: "EP",
  single: "Single",
  mix: "Mix",
  project: "Project",
  experiment: "Experiment",
};

export const releaseStageLabels: Record<ReleaseStage, string> = {
  released: "Released",
  forthcoming: "Forthcoming",
  in_development: "In development",
  concept: "Concept",
};

export const eventFormatLabels: Record<EventFormat, string> = {
  dj_set: "DJ set",
  live_electronic: "Live electronic",
  collaboration: "Collaboration",
  full_band: "Full Band Experience",
};

export const archiveCategoryLabels: Record<ArchiveCategory, string> = {
  release: "Releases",
  artwork: "Artwork",
  photography: "Photography",
  video: "Video",
  live: "Live",
  collaboration: "Collaborations",
  studio: "Studio",
  historical: "Historical",
  project: "Projects",
};

export const alchemyKindLabels: Record<AlchemyKind, string> = {
  experiment: "Sound experiments",
  research: "Sonic research",
  production_note: "Production notes",
  philosophy: "Production philosophy",
  concept: "Unreleased concepts",
  collaboration: "Creative collaborations",
};

export const journalCategoryLabels: Record<JournalCategory, string> = {
  reflection: "Reflection",
  commentary: "Music commentary",
  production: "Production insight",
  philosophy: "Creative philosophy",
  studio: "Studio notes",
  culture: "Cultural observation",
  announcement: "Announcement",
  behind_the_scenes: "Behind the scenes",
};

export const enquiryTypeLabels: Record<EnquiryType, string> = {
  dj_booking: "DJ booking",
  live_performance: "Live performance",
  full_band: "Full Band Experience",
  production: "Music production",
  sound_engineering: "Sound engineering",
  collaboration: "Collaboration",
  label_industry: "Label & industry",
  general: "General enquiry",
};

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  in_review: "In review",
  responded: "Responded",
  confirmed: "Confirmed",
  declined: "Declined",
  archived: "Archived",
};

export const mediaPermissionLabels: Record<MediaPermission, string> = {
  owned: "Owned by the artist",
  licensed: "Licensed",
  permission_granted: "Permission granted",
  pending: "Permission pending",
  unknown: "Unknown",
};

export const mediaStatusLabels: Record<MediaStatus, string> = {
  pending_review: "Pending review",
  approved: "Approved for publication",
  rejected: "Rejected",
  archived: "Archived",
};

export const budgetRanges = [
  "Under R10 000",
  "R10 000 – R25 000",
  "R25 000 – R50 000",
  "R50 000 – R100 000",
  "Over R100 000",
  "To be discussed",
] as const;

export function options<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

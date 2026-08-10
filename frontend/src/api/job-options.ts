export type Option = { label: string; value: string };

export const getLabelValue = (options: Option[], value: string) => {
  return options.find((option) => option.value === value)?.label;
};

export const CONTRACT_TYPE_OPTIONS: Option[] = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Temporary", value: "TEMPORARY" },
  { label: "Freelance", value: "FREELANCE" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Apprenticeship", value: "APPRENTICESHIP" },
  { label: "VIE", value: "VIE" },
];

export const STATUS_OPTIONS: Option[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Filled", value: "filled" },
  { label: "Archived", value: "archived" },
  { label: "Cancelled", value: "cancelled" },
];

export const WORK_MODE_OPTIONS: Option[] = [
  { label: "On-site", value: "onsite" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
];

export const SEARCH_WORK_MODE_OPTIONS: Option[] = [
  { label: "All work modes", value: "" },
  ...WORK_MODE_OPTIONS,
];

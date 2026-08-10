import type {
  ContractType,
  Job,
  JobSearchParams,
  JobStatus,
  WorkMode,
} from "../types";

const JOBS_ERROR_MESSAGE = "Unable to load jobs. Please try again.";
export const buildJobsSearchParams = (
  filters: JobSearchParams,
): URLSearchParams => {
  const searchParams = new URLSearchParams();
  const title = filters.title?.trim();
  const location = filters.location?.trim();

  if (title) searchParams.set("title", title);
  if (location) searchParams.set("location", location);
  if (filters.work_mode) searchParams.set("work_mode", filters.work_mode);

  return searchParams;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isContractType = (value: unknown): value is ContractType =>
  value === "FULL_TIME" ||
  value === "PART_TIME" ||
  value === "TEMPORARY" ||
  value === "FREELANCE" ||
  value === "INTERNSHIP" ||
  value === "APPRENTICESHIP" ||
  value === "VIE";

const isJobStatus = (value: unknown): value is JobStatus =>
  value === "draft" ||
  value === "published" ||
  value === "filled" ||
  value === "archived" ||
  value === "cancelled";

const isWorkMode = (value: unknown): value is WorkMode =>
  value === "onsite" || value === "remote" || value === "hybrid";

const isJob = (value: unknown): value is Job => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    (typeof value.description === "string" || value.description === null) &&
    isContractType(value.contract_type) &&
    typeof value.office === "string" &&
    (isJobStatus(value.status) || value.status === null) &&
    (isWorkMode(value.work_mode) || value.work_mode === null) &&
    (typeof value.profession_id === "number" || value.profession_id === null) &&
    typeof value.inserted_at === "string" &&
    typeof value.updated_at === "string"
  );
};

export const fetchJobs = async (
  filters: JobSearchParams,
  signal?: AbortSignal,
): Promise<Job[]> => {
  try {
    const searchParams = buildJobsSearchParams(filters);
    const query = searchParams.toString();
    const response = await fetch(`/api/jobs${query ? `?${query}` : ""}`, {
      signal,
    });

    if (!response.ok) throw new Error(JOBS_ERROR_MESSAGE);

    const payload: unknown = await response.json();

    if (
      !isRecord(payload) ||
      !Array.isArray(payload.data) ||
      !payload.data.every(isJob)
    ) {
      throw new Error(JOBS_ERROR_MESSAGE);
    }

    return payload.data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new Error(JOBS_ERROR_MESSAGE);
  }
};

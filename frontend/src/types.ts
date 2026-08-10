// Type definitions for the ATS frontend

export type ContractType =
  | "FULL_TIME"
  | "PART_TIME"
  | "TEMPORARY"
  | "FREELANCE"
  | "INTERNSHIP"
  | "APPRENTICESHIP"
  | "VIE";

export type JobStatus =
  | "draft"
  | "published"
  | "filled"
  | "archived"
  | "cancelled";

export type WorkMode = "onsite" | "remote" | "hybrid";

export interface JobSearchParams {
  title?: string;
  location?: string;
  work_mode?: WorkMode;
}

export interface Job {
  id: number;
  title: string;
  description: string | null;
  contract_type: ContractType;
  office: string;
  status: JobStatus | null;
  work_mode: WorkMode | null;
  profession_id: number | null;
  inserted_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface JobsApiResponse {
  data: Job[];
}

export interface Applicant {
  id: number;
  application_date: string;
  status: string;
  salary_expectation: number;
  candidate: Candidate;
}

export interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  last_known_job: string;
}

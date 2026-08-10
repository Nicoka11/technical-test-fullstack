import { useCallback, useEffect, useState } from "react";

import { fetchJobs } from "../api/jobs";

import type { Job, JobSearchParams } from "../types";

export type JobsStatus = "loading" | "success" | "error";

interface JobsState {
  jobs: Job[];
  status: JobsStatus;
  error: string | null;
}

interface UseJobsResult extends JobsState {
  retry: () => void;
}

export const useJobs = ({
  title,
  location,
  work_mode,
}: JobSearchParams): UseJobsResult => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<JobsState>({
    jobs: [],
    status: "loading",
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      status: "loading",
      error: null,
    }));

    fetchJobs({ title, location, work_mode }, controller.signal)
      .then((jobs) => {
        if (controller.signal.aborted) return;
        setState({ jobs, status: "success", error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        setState({
          jobs: [],
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Unable to load jobs. Please try again.",
        });
      });

    return () => controller.abort();
  }, [attempt, location, title, work_mode]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
};

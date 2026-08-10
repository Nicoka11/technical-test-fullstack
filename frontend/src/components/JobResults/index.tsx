import { Link } from "react-router-dom";
import { Button } from "welcome-ui/Button";
import { Card } from "welcome-ui/Card";
import { Hint } from "welcome-ui/Hint";
import { Loader } from "welcome-ui/Loader";
import { Tag } from "welcome-ui/Tag";
import { Text } from "welcome-ui/Text";

import { getContractTypeLabel } from "./utils";

import type { JobsStatus } from "../../hooks/useJobs";
import type { Job } from "../../types";

interface JobResultsProps {
  error: string | null;
  hasFilters: boolean;
  jobs: Job[];
  onClear: () => void;
  onRetry: () => void;
  status: JobsStatus;
}

const getStatusMessage = (
  status: JobsStatus,
  jobs: Job[],
  hasFilters: boolean,
) => {
  if (status === "loading") return "Loading jobs";
  if (status === "error") return "";
  if (jobs.length === 0) {
    return hasFilters ? "No jobs match your filters" : "No jobs are available";
  }

  return `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"} loaded`;
};

export const JobResults = ({
  error,
  hasFilters,
  jobs,
  onClear,
  onRetry,
  status,
}: JobResultsProps) => {
  const statusMessage = getStatusMessage(status, jobs, hasFilters);

  return (
    <div>
      <span
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        role="status"
      >
        {statusMessage}
      </span>

      {status === "loading" && (
        <div className="flex items-center justify-center gap-sm py-xl">
          <Loader size="sm" />
          <Text>Loading jobs…</Text>
        </div>
      )}

      {status === "error" && (
        <Card size="sm">
          <Card.Body>
            <Hint variant="danger">
              {error ?? "Unable to load jobs. Please try again."}
            </Hint>
            <Button className="mt-md" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </Card.Body>
        </Card>
      )}

      {status === "success" && jobs.length === 0 && (
        <Card size="sm">
          <Card.Body>
            <Text variant="heading-sm">
              {hasFilters
                ? "No jobs match your filters"
                : "No jobs are available"}
            </Text>
            <Text className="mt-xs" variant="body-sm">
              {hasFilters
                ? "Try changing or clearing your search filters."
                : "Check back later for new opportunities."}
            </Text>
            {hasFilters && (
              <Button
                className="mt-md"
                size="sm"
                variant="tertiary"
                onClick={onClear}
              >
                Clear filters
              </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {status === "success" && jobs.length > 0 && (
        <div className="flex flex-col gap-md">
          {jobs.map((job) => (
            <Card key={job.id} size="sm">
              <Card.Body>
                <div className="flex items-start justify-between gap-md">
                  <div className="min-w-0 flex-1">
                    <Link
                      className="no-underline hover:underline"
                      to={`/jobs/${job.id}`}
                    >
                      <Text variant="heading-md">{job.title}</Text>
                    </Link>
                    {job.description && (
                      <Text className="mt-xs" lines={2} variant="body-sm">
                        {job.description}
                      </Text>
                    )}
                    <div className="mt-sm flex flex-wrap gap-xs">
                      <Tag size="md" variant="blue">
                        {getContractTypeLabel(job.contract_type)}
                      </Tag>
                      <Tag size="md" variant="light-blue">
                        {job.office}
                      </Tag>
                      {job.status && (
                        <Tag size="md" variant="green">
                          {job.status}
                        </Tag>
                      )}
                    </div>
                  </div>
                  <Button as={Link} size="sm" to={`/jobs/${job.id}/apply`}>
                    Apply
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "welcome-ui/Button";
import { Loader } from "welcome-ui/Loader";
import { Text } from "welcome-ui/Text";

import { buildJobsSearchParams } from "../api/jobs";
import { logout } from "../api/logout";
import { JobResults } from "../components/JobResults";
import { JobSearchForm } from "../components/JobSearchForm";
import { useJobs } from "../hooks/useJobs";

import type { JobSearchParams, WorkMode } from "../types";

interface User {
  id: string | number;
  email: string;
}

const isUser = (value: unknown): value is User =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  (typeof value.id === "string" || typeof value.id === "number") &&
  "email" in value &&
  typeof value.email === "string";

const isWorkMode = (value: string | null): value is WorkMode =>
  value === "onsite" || value === "remote" || value === "hybrid";

const readJobSearchParams = (
  searchParams: URLSearchParams,
): JobSearchParams => {
  const filters: JobSearchParams = {};
  const title = searchParams.get("title")?.trim();
  const location = searchParams.get("location")?.trim();
  const workMode = searchParams.get("work_mode");

  if (title) filters.title = title;
  if (location) filters.location = location;
  if (isWorkMode(workMode)) filters.work_mode = workMode;

  return filters;
};

export const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readJobSearchParams(searchParams);
  const { error, jobs, retry, status } = useJobs(filters);
  const [hasBearerToken, setHasBearerToken] = useState(() =>
    Boolean(Cookies.get("user-token")),
  );
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const hasFilters = Boolean(
    filters.title || filters.location || filters.work_mode,
  );

  useEffect(() => {
    const csrfToken = Cookies.get("technical-test-csrf-token");
    const bearerToken = Cookies.get("user-token");

    if (bearerToken) {
      void (async () => {
        try {
          const res = await fetch("/api/me", {
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${bearerToken}`,
              ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
            },
          });

          if (res.ok) {
            const body: unknown = await res.json().catch(() => null);
            const userData =
              typeof body === "object" && body !== null && "data" in body
                ? body.data
                : null;
            setUser(isUser(userData) ? userData : null);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      })();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Clear local auth state even when the best-effort API request fails.
    }
    setUser(null);
    setHasBearerToken(false);
    void navigate("/signin");
  };

  const handleSearch = (nextFilters: JobSearchParams) => {
    setSearchParams(buildJobsSearchParams(nextFilters));
  };

  const handleClear = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="p-xl max-w-1200 my-0 mx-auto">
      <div className="flex items-center justify-between mb-lg">
        <Text variant="heading-xl">Job Listings</Text>

        {hasBearerToken ? (
          <div className="flex items-center gap-sm">
            {user ? (
              <>
                <Text variant="body-sm">{user.email}</Text>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => void handleLogout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Loader size="sm" />
            )}
          </div>
        ) : (
          <div className="flex gap-sm">
            <Button as={Link} to="/signup" size="sm">
              Sign up
            </Button>
            <Button as={Link} to="/signin" size="sm" variant="tertiary">
              Sign in
            </Button>
          </div>
        )}
      </div>

      <JobSearchForm
        filters={filters}
        loading={status === "loading"}
        onClear={handleClear}
        onSubmit={handleSearch}
      />

      {user && (
        <div className="mb-md flex items-center justify-end gap-sm">
          <Button as={Link} to="/jobs/new" size="sm">
            Create a new job
          </Button>
        </div>
      )}

      <JobResults
        error={error}
        hasFilters={hasFilters}
        jobs={jobs}
        onClear={handleClear}
        onRetry={retry}
        status={status}
      />
    </div>
  );
};

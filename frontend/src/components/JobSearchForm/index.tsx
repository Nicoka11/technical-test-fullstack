import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "welcome-ui/Button";
import { Card } from "welcome-ui/Card";
import { Field } from "welcome-ui/Field";
import { InputText } from "welcome-ui/InputText";
import { Select } from "welcome-ui/Select";

import { useDebounce } from "../../hooks/useDebounce";

import type { JobSearchParams, WorkMode } from "../../types";

const WORK_MODE_OPTIONS = [
  { label: "All work modes", value: "" },
  { label: "On-site", value: "onsite" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
];

interface JobSearchFormProps {
  filters: JobSearchParams;
  loading: boolean;
  onClear: () => void;
  onSubmit: (filters: JobSearchParams) => void;
}

const isWorkMode = (value: unknown): value is WorkMode =>
  value === "onsite" || value === "remote" || value === "hybrid";

type JobSearchFormValues = {
  title: string;
  location: string;
  work_mode: WorkMode | "";
};

const SEARCH_DEBOUNCE_MS = 300;

const toFormValues = (filters: JobSearchParams): JobSearchFormValues => ({
  title: filters.title ?? "",
  location: filters.location ?? "",
  work_mode: filters.work_mode ?? "",
});

const toSearchParams = ({
  title,
  location,
  work_mode,
}: JobSearchFormValues): JobSearchParams => {
  const filters: JobSearchParams = {};
  const normalizedTitle = title.trim();
  const normalizedLocation = location.trim();

  if (normalizedTitle) filters.title = normalizedTitle;
  if (normalizedLocation) filters.location = normalizedLocation;
  if (work_mode) filters.work_mode = work_mode;

  return filters;
};

const filtersKey = (filters: JobSearchParams) =>
  JSON.stringify([
    filters.title ?? "",
    filters.location ?? "",
    filters.work_mode ?? "",
  ]);

export const JobSearchForm = ({
  filters,
  loading,
  onClear,
  onSubmit,
}: JobSearchFormProps) => {
  const { control, register, reset } = useForm<JobSearchFormValues>({
    defaultValues: toFormValues(filters),
  });
  const {
    title = "",
    location = "",
    work_mode = "",
  } = useWatch({
    control,
    defaultValue: toFormValues(filters),
  });
  const debouncedTitle = useDebounce(title, SEARCH_DEBOUNCE_MS);
  const debouncedLocation = useDebounce(location, SEARCH_DEBOUNCE_MS);
  const submittedFiltersKey = useRef(filtersKey(filters));

  useEffect(() => {
    const nextValues: JobSearchFormValues = {
      title: filters.title ?? "",
      location: filters.location ?? "",
      work_mode: filters.work_mode ?? "",
    };
    submittedFiltersKey.current = filtersKey(toSearchParams(nextValues));
    reset(nextValues);
  }, [filters.location, filters.title, filters.work_mode, reset]);

  useEffect(() => {
    // Wait for text inputs to settle before combining them with other filters.
    if (title !== debouncedTitle || location !== debouncedLocation) return;

    const nextFilters = toSearchParams({
      title: debouncedTitle,
      location: debouncedLocation,
      work_mode,
    });
    const nextFiltersKey = filtersKey(nextFilters);

    if (nextFiltersKey === submittedFiltersKey.current) return;

    submittedFiltersKey.current = nextFiltersKey;
    onSubmit(nextFilters);
  }, [debouncedLocation, debouncedTitle, location, onSubmit, title, work_mode]);

  const hasFilters = Boolean(
    filters.title || filters.location || filters.work_mode,
  );

  return (
    <Card size="sm" className="mb-lg" style={{ overflow: "visible" }}>
      <Card.Body style={{ overflow: "visible" }}>
        <form aria-busy={loading} aria-label="Search jobs">
          <div className="grid grid-cols-1 gap-md md:grid-cols-3">
            <Field label="Job title">
              <InputText
                {...register("title")}
                placeholder="e.g. Frontend Engineer"
              />
            </Field>

            <Field label="Location">
              <InputText {...register("location")} placeholder="e.g. Paris" />
            </Field>

            <Field label="Work mode">
              <Controller
                control={control}
                name="work_mode"
                render={({ field }) => (
                  <Select
                    aria-label="Work mode"
                    name={field.name}
                    options={WORK_MODE_OPTIONS}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(isWorkMode(value) ? value : "");
                    }}
                  />
                )}
              />
            </Field>
          </div>

          {hasFilters && (
            <div className="mt-md flex">
              <Button type="button" variant="tertiary" onClick={onClear}>
                Clear filters
              </Button>
            </div>
          )}
        </form>
      </Card.Body>
    </Card>
  );
};

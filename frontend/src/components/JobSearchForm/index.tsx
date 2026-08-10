import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "welcome-ui/Button";
import { Card } from "welcome-ui/Card";
import { Field } from "welcome-ui/Field";
import { InputText } from "welcome-ui/InputText";
import { Select } from "welcome-ui/Select";

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

const toFormValues = (filters: JobSearchParams): JobSearchFormValues => ({
  title: filters.title ?? "",
  location: filters.location ?? "",
  work_mode: filters.work_mode ?? "",
});

export const JobSearchForm = ({
  filters,
  loading,
  onClear,
  onSubmit,
}: JobSearchFormProps) => {
  const { control, handleSubmit, register, reset } =
    useForm<JobSearchFormValues>({
      defaultValues: toFormValues(filters),
    });

  useEffect(() => {
    reset({
      title: filters.title ?? "",
      location: filters.location ?? "",
      work_mode: filters.work_mode ?? "",
    });
  }, [filters.location, filters.title, filters.work_mode, reset]);

  const submit = handleSubmit(({ title, location, work_mode }) => {
    const nextFilters: JobSearchParams = {};
    const normalizedTitle = title.trim();
    const normalizedLocation = location.trim();

    if (normalizedTitle) nextFilters.title = normalizedTitle;
    if (normalizedLocation) nextFilters.location = normalizedLocation;
    if (work_mode) nextFilters.work_mode = work_mode;

    onSubmit(nextFilters);
  });

  const hasFilters = Boolean(
    filters.title || filters.location || filters.work_mode,
  );

  return (
    <Card size="sm" className="mb-lg" style={{ overflow: "visible" }}>
      <Card.Body style={{ overflow: "visible" }}>
        <form aria-label="Search jobs" onSubmit={(event) => void submit(event)}>
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

          <div className="mt-md flex flex-wrap gap-sm">
            <Button type="submit" disabled={loading} isLoading={loading}>
              Search jobs
            </Button>
            {hasFilters && (
              <Button type="button" variant="tertiary" onClick={onClear}>
                Clear filters
              </Button>
            )}
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

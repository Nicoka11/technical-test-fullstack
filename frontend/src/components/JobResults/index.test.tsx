import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { JobResults } from ".";

import type { Job } from "../../types";
import type { ComponentProps } from "react";

const job: Job = {
  id: 1,
  title: "Frontend Engineer",
  description: "Build accessible interfaces.",
  contract_type: "FULL_TIME",
  office: "Paris",
  status: "published",
  work_mode: "remote",
  profession_id: 2,
  inserted_at: "2026-08-10T08:00:00Z",
  updated_at: "2026-08-10T08:00:00Z",
};

const renderResults = (
  props: Partial<ComponentProps<typeof JobResults>> = {},
) =>
  render(
    <MemoryRouter>
      <JobResults
        error={null}
        hasFilters={false}
        jobs={[]}
        onClear={vi.fn()}
        onRetry={vi.fn()}
        status="success"
        {...props}
      />
    </MemoryRouter>,
  );

describe("JobResults", () => {
  it("announces the loading state", () => {
    renderResults({ status: "loading" });

    expect(screen.getByRole("status")).toHaveTextContent("Loading jobs");
  });

  it("keeps one concise status region across result state changes", () => {
    const { rerender } = renderResults({ status: "loading" });
    const statusRegion = screen.getByRole("status");

    rerender(
      <MemoryRouter>
        <JobResults
          error={null}
          hasFilters={false}
          jobs={[job]}
          onClear={vi.fn()}
          onRetry={vi.fn()}
          status="success"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toBe(statusRegion);
    expect(statusRegion).toHaveTextContent("1 job loaded");
  });

  it("shows an understandable error and retries", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderResults({
      error: "Unable to load jobs. Please try again.",
      onRetry,
      status: "error",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to load jobs. Please try again.",
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("explains filtered empty results and clears filters", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderResults({ hasFilters: true, onClear });

    expect(screen.getByRole("status")).toHaveTextContent(
      "No jobs match your filters",
    );
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("explains unfiltered empty results without a clear action", () => {
    renderResults();

    expect(screen.getByRole("status")).toHaveTextContent(
      "No jobs are available",
    );
    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();
  });

  it("renders each job once with existing detail and application links", () => {
    renderResults({ jobs: [job] });

    expect(screen.getByRole("link", { name: job.title })).toHaveAttribute(
      "href",
      "/jobs/1",
    );
    expect(screen.getByRole("link", { name: "Apply" })).toHaveAttribute(
      "href",
      "/jobs/1/apply",
    );
    expect(screen.getByText(job.description ?? "")).toBeVisible();
    expect(screen.getByText("Full Time")).toBeVisible();
    expect(screen.getByText("Paris")).toBeVisible();
    expect(screen.getByText("published")).toBeVisible();
  });
});

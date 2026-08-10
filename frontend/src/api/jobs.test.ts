import { afterEach, describe, expect, it, vi } from "vitest";

import { buildJobsSearchParams, fetchJobs } from "./jobs";

import type { Job } from "../types";

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildJobsSearchParams", () => {
  it("serializes trimmed supported filters and omits empty values", () => {
    const searchParams = buildJobsSearchParams({
      title: "  Frontend Engineer  ",
      location: "   ",
      work_mode: "remote",
    });

    expect(searchParams.toString()).toBe(
      "title=Frontend+Engineer&work_mode=remote",
    );
  });
});

describe("fetchJobs", () => {
  it("requests filtered jobs and returns the validated response data", async () => {
    const signal = new AbortController().signal;
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: [job] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const jobs = await fetchJobs(
      { title: "Frontend", location: "Paris", work_mode: "remote" },
      signal,
    );

    expect(jobs).toEqual([job]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs?title=Frontend&location=Paris&work_mode=remote",
      { signal },
    );
  });

  it("accepts nullable optional fields returned by the backend", async () => {
    const nullableJob = { ...job, status: null, work_mode: null };
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ data: [nullableJob] }), {
          status: 200,
        }),
      ),
    );

    await expect(fetchJobs({})).resolves.toEqual([nullableJob]);
  });

  it("requests all jobs without a trailing query string when filters are empty", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchJobs({});

    expect(fetchMock).toHaveBeenCalledWith("/api/jobs", {
      signal: undefined,
    });
  });

  it("uses a stable error message when the network request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(fetchJobs({})).rejects.toThrow(
      "Unable to load jobs. Please try again.",
    );
  });

  it.each([
    new Response(null, { status: 500 }),
    new Response(JSON.stringify({ data: [{ id: 1 }] }), { status: 200 }),
  ])("rejects unsuccessful or invalid responses", async (response) => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(response),
    );

    await expect(fetchJobs({})).rejects.toThrow(
      "Unable to load jobs. Please try again.",
    );
  });
});

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useJobs } from "./useJobs";

import type { Job, JobSearchParams } from "../types";

const remoteJob: Job = {
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

const onsiteJob: Job = {
  ...remoteJob,
  id: 2,
  title: "Product Engineer",
  work_mode: "onsite",
};

const jobsResponse = (jobs: Job[]) =>
  new Response(JSON.stringify({ data: jobs }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useJobs", () => {
  it("moves from loading to successful job results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jobsResponse([remoteJob])),
    );

    const { result } = renderHook(() => useJobs({ work_mode: "remote" }));

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.jobs).toEqual([remoteJob]);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error and retries the current filters", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(jobsResponse([remoteJob]));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useJobs({ title: "Frontend" }));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe(
      "Unable to load jobs. Please try again.",
    );

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.jobs).toEqual([remoteJob]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("aborts an older request and ignores it if it still resolves", async () => {
    const signals: AbortSignal[] = [];
    let resolveFirstRequest: (response: Response) => void = () => {
      throw new Error("The first request was not started.");
    };
    const firstRequest = new Promise<Response>((resolve) => {
      resolveFirstRequest = resolve;
    });
    const fetchMock = vi.fn<typeof fetch>((url, init) => {
      const signal = init?.signal;
      if (signal) signals.push(signal);

      const requestedUrl =
        typeof url === "string"
          ? url
          : url instanceof URL
            ? url.href
            : url.url;
      if (requestedUrl.includes("title=Frontend")) return firstRequest;

      return Promise.resolve(jobsResponse([onsiteJob]));
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(
      ({ filters }: { filters: JobSearchParams }) => useJobs(filters),
      { initialProps: { filters: { title: "Frontend" } } },
    );

    rerender({ filters: { title: "Product" } });

    await waitFor(() => expect(result.current.jobs).toEqual([onsiteJob]));
    expect(signals[0]?.aborted).toBe(true);

    await act(async () => {
      resolveFirstRequest(jobsResponse([remoteJob]));
      await firstRequest;
    });

    expect(result.current.jobs).toEqual([onsiteJob]);
    expect(result.current.error).toBeNull();
  });
});

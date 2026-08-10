import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { JobList } from "./JobList";

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

const unfilteredJob: Job = {
  ...job,
  id: 2,
  title: "Product Designer",
};

const jobsResponse = (jobs: Job[]) =>
  new Response(JSON.stringify({ data: jobs }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const getRequestUrl = (input: RequestInfo | URL) => {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.toString() : input.url;
};

const countRequests = (
  calls: Array<Parameters<typeof fetch>>,
  expectedUrl: string,
) =>
  calls.filter(
    ([input, init]) =>
      getRequestUrl(input) === expectedUrl &&
      init?.signal instanceof AbortSignal,
  ).length;

const hasRequest = (
  calls: Array<Parameters<typeof fetch>>,
  expectedUrl: string,
) => countRequests(calls, expectedUrl) > 0;

const LocationProbe = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <output data-testid="location-search">{location.search}</output>
      <button type="button" onClick={() => void navigate(-1)}>
        Back in history
      </button>
      <button type="button" onClick={() => void navigate(1)}>
        Forward in history
      </button>
    </div>
  );
};

const renderJobList = (initialEntry = "/") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <JobList />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

afterEach(() => {
  document.cookie = "user-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  vi.unstubAllGlobals();
});

describe("JobList search integration", () => {
  it("restores URL filters and requests matching backend results", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jobsResponse([job]));
    vi.stubGlobal("fetch", fetchMock);

    renderJobList("/?title=Frontend&location=Paris&work_mode=remote");

    expect(screen.getByRole("textbox", { name: "Job title" })).toHaveValue(
      "Frontend",
    );
    expect(screen.getByRole("textbox", { name: "Location" })).toHaveValue(
      "Paris",
    );
    expect(
      screen.getByRole("combobox", { name: "Work mode" }),
    ).toHaveTextContent("Remote");
    expect(
      await screen.findByRole("link", { name: "Frontend Engineer" }),
    ).toHaveAttribute("href", "/jobs/1");
    expect(
      await screen.findByText("1 job found for your search"),
    ).toBeInTheDocument();

    expect(
      hasRequest(
        fetchMock.mock.calls,
        "/api/jobs?title=Frontend&location=Paris&work_mode=remote",
      ),
    ).toBe(true);
  });

  it("keeps search available while loading a registered user", async () => {
    document.cookie = "user-token=signed-token; path=/";
    const fetchMock = vi.fn<typeof fetch>((input) => {
      if (getRequestUrl(input) === "/api/me") {
        return Promise.resolve(
          new Response(
            JSON.stringify({ data: { id: 7, email: "user@example.com" } }),
            { status: 200 },
          ),
        );
      }

      return Promise.resolve(jobsResponse([job]));
    });
    vi.stubGlobal("fetch", fetchMock);

    renderJobList("/?title=Frontend");

    expect(await screen.findByText("user@example.com")).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Frontend Engineer" }),
    ).toBeInTheDocument();
    expect(hasRequest(fetchMock.mock.calls, "/api/jobs?title=Frontend")).toBe(
      true,
    );
  });

  it("writes submitted filters to the URL and fetches them", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jobsResponse([job]));
    vi.stubGlobal("fetch", fetchMock);
    renderJobList();

    await user.type(
      screen.getByRole("textbox", { name: "Job title" }),
      "Frontend",
    );
    await user.type(screen.getByRole("textbox", { name: "Location" }), "Paris");
    await user.click(screen.getByRole("button", { name: "open menu" }));
    await user.click(screen.getByRole("option", { name: "Remote" }));
    await user.click(screen.getByRole("button", { name: "Search jobs" }));

    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "?title=Frontend&location=Paris&work_mode=remote",
      ),
    );
    await waitFor(() =>
      expect(
        hasRequest(
          fetchMock.mock.calls,
          "/api/jobs?title=Frontend&location=Paris&work_mode=remote",
        ),
      ).toBe(true),
    );
  });

  it("clear, back, and forward navigation refetch and restore results", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>((input) => {
      const url = getRequestUrl(input);
      return Promise.resolve(
        jobsResponse(url.includes("title=Frontend") ? [job] : [unfilteredJob]),
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    renderJobList("/?title=Frontend");

    await screen.findByRole("link", { name: "Frontend Engineer" });
    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    await screen.findByRole("link", { name: "Product Designer" });
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
    expect(countRequests(fetchMock.mock.calls, "/api/jobs")).toBe(1);

    await user.click(screen.getByRole("button", { name: "Back in history" }));

    await screen.findByRole("link", { name: "Frontend Engineer" });
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "?title=Frontend",
    );
    expect(screen.getByRole("textbox", { name: "Job title" })).toHaveValue(
      "Frontend",
    );
    expect(
      countRequests(fetchMock.mock.calls, "/api/jobs?title=Frontend"),
    ).toBe(2);

    await user.click(
      screen.getByRole("button", { name: "Forward in history" }),
    );

    await screen.findByRole("link", { name: "Product Designer" });
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
    expect(countRequests(fetchMock.mock.calls, "/api/jobs")).toBe(2);
  });
});

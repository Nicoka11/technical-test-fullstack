import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JobSearchForm } from ".";

describe("JobSearchForm", () => {
  it("renders URL-derived filters in accessible Welcome UI controls", () => {
    render(
      <JobSearchForm
        filters={{
          title: "Frontend",
          location: "Paris",
          work_mode: "remote",
        }}
        loading={false}
        onClear={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Job title" })).toHaveValue(
      "Frontend",
    );
    expect(screen.getByRole("textbox", { name: "Location" })).toHaveValue(
      "Paris",
    );
    expect(
      screen.getByRole("combobox", { name: "Work mode" }),
    ).toHaveTextContent("Remote");
  });

  it("applies normalized title after the search debounce", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <JobSearchForm
        filters={{}}
        loading={false}
        onClear={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Job title" }),
      "  Frontend  ",
    );

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(
      () => expect(onSubmit).toHaveBeenCalledWith({ title: "Frontend" }),
      { timeout: 500 },
    );
  });

  it("applies normalized location after the search debounce", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <JobSearchForm
        filters={{}}
        loading={false}
        onClear={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Location" }),
      "  Paris  ",
    );

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(
      () => expect(onSubmit).toHaveBeenCalledWith({ location: "Paris" }),
      { timeout: 500 },
    );
  });

  it("applies work mode changes immediately", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <JobSearchForm
        filters={{ work_mode: "remote" }}
        loading={false}
        onClear={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "open menu" }));
    await user.click(screen.getByRole("option", { name: "All work modes" }));

    expect(onSubmit).toHaveBeenCalledWith({});
    expect(
      screen.getByRole("combobox", { name: "Work mode" }),
    ).toHaveTextContent("All work modes");
  });

  it("synchronizes draft controls when URL-derived filters change", () => {
    const { rerender } = render(
      <JobSearchForm
        filters={{ title: "Frontend", work_mode: "remote" }}
        loading={false}
        onClear={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    rerender(
      <JobSearchForm
        filters={{ location: "London", work_mode: "onsite" }}
        loading={false}
        onClear={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Job title" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Location" })).toHaveValue(
      "London",
    );
    expect(
      screen.getByRole("combobox", { name: "Work mode" }),
    ).toHaveTextContent("On-site");
  });

  it("shows clear only for applied filters", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { rerender } = render(
      <JobSearchForm
        filters={{}}
        loading={false}
        onClear={onClear}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Work mode" }),
    ).toHaveTextContent("All work modes");
    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();

    rerender(
      <JobSearchForm
        filters={{ title: "Frontend" }}
        loading
        onClear={onClear}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("form", { name: "Search jobs" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

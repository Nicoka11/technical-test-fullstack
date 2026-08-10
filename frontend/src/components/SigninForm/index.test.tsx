import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { SignInForm } from ".";

const onSubmit = vi.fn();

describe("SignInForm", () => {
  it("renders email, password and submit button", () => {
    render(
      <SignInForm
        onSubmit={onSubmit}
        serverError={null}
        initialLoading={false}
      />,
    );

    const form = screen.getByTestId("signin-form");

    expect(form).toBeVisible();
  });
});

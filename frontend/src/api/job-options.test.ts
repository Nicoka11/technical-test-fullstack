import { describe, expect, it } from "vitest";

import { getLabelValue } from "./job-options";

describe("getLabelValue", () => {
  const options = [
    { label: "Full Time", value: "FULL_TIME" },
    { label: "Part Time", value: "PART_TIME" },
  ];

  it("returns the label for a matching value", () => {
    expect(getLabelValue(options, "FULL_TIME")).toBe("Full Time");
  });

  it("returns undefined when the value is not found", () => {
    expect(getLabelValue(options, "FREELANCE")).toBeUndefined();
  });
});

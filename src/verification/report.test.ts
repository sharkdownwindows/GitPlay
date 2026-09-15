import { describe, expect, it } from "vitest";
import fixture from "../../public/verification.json";
import { isVerificationReport } from "./report";

describe("public/verification.json", () => {
  it("parse được bằng kiểu ở Contract 2", () => {
    expect(isVerificationReport(fixture)).toBe(true);
  });

  it("có đủ trường bắt buộc", () => {
    expect(fixture.generatedAt).toBeTruthy();
    expect(fixture.commitSha).toHaveLength(40);
    expect(fixture.gitVersion).toMatch(/^git version /);
    expect(Object.keys(fixture.coverage).sort()).toEqual(
      ["branch", "checkout", "commit", "merge", "switch"],
    );
    expect(fixture.scaling[0]?.points).toHaveLength(4);
  });
});

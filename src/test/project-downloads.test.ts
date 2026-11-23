import { describe, expect, it } from "vitest";

import { allProjectsZip, projects } from "@/lib/projects";

// The download button only renders when a project carries a zip pointer, so the
// pointer data is the rule: every packaged project must resolve to a same-origin
// Lovable asset, and the one project whose code could not be fetched must stay
// without a button instead of pointing at a missing file.
describe("Project downloads", () => {
  it("lists 22 projects", () => {
    expect(projects).toHaveLength(22);
  });

  it("offers a download for every project except Remix of The Freedom Framework", () => {
    const withoutZip = projects.filter((p) => !p.zip).map((p) => p.name);

    expect(withoutZip).toEqual(["Remix of The Freedom Framework"]);
    expect(projects.filter((p) => p.zip)).toHaveLength(21);
  });

  it("offers one combined download with all packaged projects", () => {
    expect(allProjectsZip.url.startsWith("/__l5e/assets-v1/")).toBe(true);
    expect(allProjectsZip.url.endsWith(`/${allProjectsZip.name}`)).toBe(true);
    expect(allProjectsZip.name.endsWith(".zip")).toBe(true);
    expect(allProjectsZip.size).toBeGreaterThan(0);
  });

  it("points every download at a same-origin asset with a zip name and a real size", () => {
    for (const p of projects.filter((p) => p.zip)) {
      const zip = p.zip!;
      expect(zip.url.startsWith("/__l5e/assets-v1/")).toBe(true);
      expect(zip.url.endsWith(`/${zip.name}`)).toBe(true);
      expect(zip.name.endsWith(".zip")).toBe(true);
      expect(zip.size).toBeGreaterThan(0);
    }
  });
});

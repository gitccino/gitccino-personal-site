import { expect, it } from "bun:test";
import { createAuthorName } from "../lib/author-name";

it("creates an adjective and noun name", () => {
  expect(createAuthorName(() => 0)).toBe("Bright Birch");
});

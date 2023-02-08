import { greet } from "./index";

test("greeting", () => {
  expect(greet("test")).toBe("Hello test!");
});

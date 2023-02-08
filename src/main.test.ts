import { greet } from "./main";

test("greeting", () => {
  expect(greet("test")).toBe("Hello test!");
});

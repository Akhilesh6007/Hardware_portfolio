// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Projects from "../src/pages/Projects";
import Contact from "../src/pages/Contact";
import Layout from "../src/components/layout/Layout";
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
vi.stubGlobal("matchMedia", () => ({
  matches: true,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
}));
vi.stubGlobal("scrollTo", vi.fn());
afterEach(cleanup);
function wrap(component: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>,
  );
}
describe("public navigation and forms", () => {
  it("filters concept builds and opens the correct case-study link", async () => {
    wrap(<Projects />);
    await screen.findByText("Gesture-Controlled Robotic Hand");
    fireEvent.click(screen.getByRole("button", { name: "Mechanical" }));
    expect(screen.queryByText("Gesture-Controlled Robotic Hand")).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Automatic Basketball Shooting Machine" })
        .getAttribute("href"),
    ).toBe("/projects/basketball-shooting-machine");
    fireEvent.change(screen.getByRole("textbox", { name: "Search builds" }), {
      target: { value: "no match" },
    });
    expect(screen.getByText("No builds in this drawer.")).toBeTruthy();
  });
  it("validates contact input with accessible errors", async () => {
    wrap(<Contact />);
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findAllByText(/Too small/);
    expect(
      screen.getByLabelText("Your name").getAttribute("aria-invalid"),
    ).toBe("true");
  });
  it("opens and closes the mobile navigation", async () => {
    wrap(<Layout />);
    const button = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }).className,
    ).toBe("open");
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });
});

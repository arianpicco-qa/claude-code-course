import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  overrides: Partial<ToolInvocation> & { args?: Record<string, unknown> }
): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: {},
    state: "result",
    result: "Success",
    ...overrides,
  } as ToolInvocation;
}

test("shows 'Creating {filename}' for create command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "create", path: "/App.jsx" },
      })}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("shows 'Editing {filename}' for str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "str_replace", path: "/components/Card.jsx" },
      })}
    />
  );
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("shows 'Editing {filename}' for insert command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "insert", path: "/utils.ts" },
      })}
    />
  );
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("shows 'Viewing {filename}' for view command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "view", path: "/index.tsx" },
      })}
    />
  );
  expect(screen.getByText("Viewing index.tsx")).toBeDefined();
});

test("shows 'Reverting {filename}' for undo_edit command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "undo_edit", path: "/App.jsx" },
      })}
    />
  );
  expect(screen.getByText("Reverting App.jsx")).toBeDefined();
});

test("extracts filename from nested path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "create", path: "src/components/ui/Button.tsx" },
      })}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("falls back to 'str_replace_editor' when args are empty", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({ args: {} })}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("falls back to 'str_replace_editor' when path is missing", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({ args: { command: "create" } })}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("falls back to 'str_replace_editor' when command is missing", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({ args: { path: "/App.jsx" } })}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("shows raw tool name for non-str_replace_editor tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "create", path: "/App.jsx" },
      })}
    />
  );
  expect(screen.getByText("file_manager")).toBeDefined();
});

test("shows green dot when state is result with truthy result", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Success",
      })}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is not result", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      } as unknown as Partial<ToolInvocation>)}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

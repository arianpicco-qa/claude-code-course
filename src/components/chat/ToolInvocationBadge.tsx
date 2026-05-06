"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFilename(path: string): string {
  return path.split("/").pop() || path;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName !== "str_replace_editor") {
    return toolName;
  }

  const command = args.command as string | undefined;
  const path = args.path as string | undefined;

  if (!command || !path) {
    return "str_replace_editor";
  }

  const filename = getFilename(path);

  switch (command) {
    case "create":
      return `Creating ${filename}`;
    case "str_replace":
    case "insert":
      return `Editing ${filename}`;
    case "view":
      return `Viewing ${filename}`;
    case "undo_edit":
      return `Reverting ${filename}`;
    default:
      return `Editing ${filename}`;
  }
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const result = "result" in toolInvocation ? toolInvocation.result : undefined;
  const label = getLabel(toolName, args as Record<string, unknown>);
  const isComplete = state === "result" && result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}

import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "@/hooks/use-auth";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { useRouter } from "next/navigation";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

const mockPush = vi.fn();

function setupRouter() {
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  setupRouter();
  vi.mocked(getAnonWorkData).mockReturnValue(null);
});

describe("initial state", () => {
  it("returns isLoading as false", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);
  });

  it("exposes signIn and signUp functions", () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.signIn).toBe("function");
    expect(typeof result.current.signUp).toBe("function");
  });
});

describe("signIn", () => {
  it("returns success result on valid credentials", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1" } as any]);

    const { result } = renderHook(() => useAuth());
    let returnValue: any;

    await act(async () => {
      returnValue = await result.current.signIn("user@example.com", "password123");
    });

    expect(returnValue).toEqual({ success: true });
  });

  it("calls signInAction with the provided email and password", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: false, error: "Invalid credentials" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(signInAction).toHaveBeenCalledWith("user@example.com", "password123");
  });

  it("sets isLoading to true while signing in and resets after", async () => {
    let resolveSignIn!: (v: any) => void;
    vi.mocked(signInAction).mockReturnValue(
      new Promise((res) => { resolveSignIn = res; })
    );

    const { result } = renderHook(() => useAuth());

    act(() => { result.current.signIn("user@example.com", "password123"); });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await act(async () => { resolveSignIn({ success: false, error: "Invalid" }); });

    expect(result.current.isLoading).toBe(false);
  });

  it("resets isLoading to false when signInAction throws", async () => {
    vi.mocked(signInAction).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("does not navigate when sign-in fails", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: false, error: "Invalid credentials" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "wrongpassword");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("returns error result when sign-in fails", async () => {
    const errorResult = { success: false, error: "Invalid credentials" };
    vi.mocked(signInAction).mockResolvedValue(errorResult);

    const { result } = renderHook(() => useAuth());
    let returnValue: any;

    await act(async () => {
      returnValue = await result.current.signIn("user@example.com", "wrongpassword");
    });

    expect(returnValue).toEqual(errorResult);
  });
});

describe("signUp", () => {
  it("returns success result on valid registration", async () => {
    vi.mocked(signUpAction).mockResolvedValue({ success: true });
    vi.mocked(getProjects).mockResolvedValue([]);
    vi.mocked(createProject).mockResolvedValue({ id: "new-proj" } as any);

    const { result } = renderHook(() => useAuth());
    let returnValue: any;

    await act(async () => {
      returnValue = await result.current.signUp("new@example.com", "password123");
    });

    expect(returnValue).toEqual({ success: true });
  });

  it("calls signUpAction with the provided email and password", async () => {
    vi.mocked(signUpAction).mockResolvedValue({ success: false, error: "Email already registered" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("existing@example.com", "password123");
    });

    expect(signUpAction).toHaveBeenCalledWith("existing@example.com", "password123");
  });

  it("sets isLoading to true while signing up and resets after", async () => {
    let resolveSignUp!: (v: any) => void;
    vi.mocked(signUpAction).mockReturnValue(
      new Promise((res) => { resolveSignUp = res; })
    );

    const { result } = renderHook(() => useAuth());

    act(() => { result.current.signUp("new@example.com", "password123"); });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await act(async () => { resolveSignUp({ success: false, error: "Taken" }); });

    expect(result.current.isLoading).toBe(false);
  });

  it("resets isLoading to false when signUpAction throws", async () => {
    vi.mocked(signUpAction).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "password123").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("does not navigate when sign-up fails", async () => {
    vi.mocked(signUpAction).mockResolvedValue({ success: false, error: "Email already registered" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("existing@example.com", "password123");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("post-sign-in routing: anonymous work present", () => {
  it("creates a project from anon work and navigates to it", async () => {
    const anonMessages = [{ role: "user", content: "make a button" }];
    const anonFsData = { "/App.jsx": { content: "..." } };

    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue({
      messages: anonMessages,
      fileSystemData: anonFsData,
    });
    vi.mocked(createProject).mockResolvedValue({ id: "anon-proj-42" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(createProject).toHaveBeenCalledWith({
      name: expect.stringContaining("Design from"),
      messages: anonMessages,
      data: anonFsData,
    });
    expect(mockPush).toHaveBeenCalledWith("/anon-proj-42");
  });

  it("clears anon work after creating the project", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue({
      messages: [{ role: "user", content: "hello" }],
      fileSystemData: {},
    });
    vi.mocked(createProject).mockResolvedValue({ id: "anon-proj" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(clearAnonWork).toHaveBeenCalled();
  });

  it("does not call getProjects when anon work with messages exists", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue({
      messages: [{ role: "user", content: "hello" }],
      fileSystemData: {},
    });
    vi.mocked(createProject).mockResolvedValue({ id: "anon-proj" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(getProjects).not.toHaveBeenCalled();
  });
});

describe("post-sign-in routing: no anon work, existing projects", () => {
  it("navigates to the most recent project", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue(null);
    vi.mocked(getProjects).mockResolvedValue([
      { id: "recent-proj" } as any,
      { id: "older-proj" } as any,
    ]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(mockPush).toHaveBeenCalledWith("/recent-proj");
  });

  it("does not create a new project when existing projects are found", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue(null);
    vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1" } as any]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(createProject).not.toHaveBeenCalled();
  });
});

describe("post-sign-in routing: no anon work, no existing projects", () => {
  it("creates a new project and navigates to it", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue(null);
    vi.mocked(getProjects).mockResolvedValue([]);
    vi.mocked(createProject).mockResolvedValue({ id: "brand-new-proj" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(createProject).toHaveBeenCalledWith({
      name: expect.stringMatching(/^New Design #\d+$/),
      messages: [],
      data: {},
    });
    expect(mockPush).toHaveBeenCalledWith("/brand-new-proj");
  });
});

describe("post-sign-in routing: edge cases", () => {
  it("treats anon work with empty messages array as no anon work", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue({
      messages: [],
      fileSystemData: { "/": {} },
    });
    vi.mocked(getProjects).mockResolvedValue([{ id: "existing-proj" } as any]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(createProject).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/existing-proj");
  });

  it("works the same for signUp as signIn in post-auth routing", async () => {
    vi.mocked(signUpAction).mockResolvedValue({ success: true });
    vi.mocked(getAnonWorkData).mockReturnValue(null);
    vi.mocked(getProjects).mockResolvedValue([{ id: "proj-99" } as any]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "password123");
    });

    expect(mockPush).toHaveBeenCalledWith("/proj-99");
  });
});

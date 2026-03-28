import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";

describe("useOptimisticMutation", () => {
  it("applies optimistic state then keeps it when request succeeds", async () => {
    const request = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    const { result } = renderHook(() => {
      const [status, setStatus] = useState("PENDING");
      const { runOptimistic } = useOptimisticMutation();

      const execute = async () =>
        runOptimistic({
          captureSnapshot: () => status,
          applyOptimistic: () => setStatus("APPROVED"),
          request,
          rollback: (snapshot) => setStatus(snapshot),
        });

      return {
        status,
        execute,
      };
    });

    await act(async () => {
      await result.current.execute();
    });

    expect(request).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("APPROVED");
  });

  it("rolls back to previous state when request fails", async () => {
    const request = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => {
      const [status, setStatus] = useState("PENDING");
      const { runOptimistic } = useOptimisticMutation();

      const execute = async () =>
        runOptimistic({
          captureSnapshot: () => status,
          applyOptimistic: () => setStatus("APPROVED"),
          request,
          rollback: (snapshot) => setStatus(snapshot),
        });

      return {
        status,
        execute,
      };
    });

    await act(async () => {
      await result.current.execute();
    });

    expect(request).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("PENDING");
  });

  it("returns boolean result for success/failure flows", async () => {
    const succeedRequest = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const failRequest = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => {
      const [value, setValue] = useState(0);
      const { runOptimistic } = useOptimisticMutation();

      const runSuccess = async () =>
        runOptimistic({
          captureSnapshot: () => value,
          applyOptimistic: () => setValue(1),
          request: succeedRequest,
          rollback: (snapshot) => setValue(snapshot),
        });

      const runFail = async () =>
        runOptimistic({
          captureSnapshot: () => value,
          applyOptimistic: () => setValue(2),
          request: failRequest,
          rollback: (snapshot) => setValue(snapshot),
        });

      return {
        runSuccess,
        runFail,
      };
    });

    let success = false;
    let failed = true;

    await act(async () => {
      success = await result.current.runSuccess();
      failed = await result.current.runFail();
    });

    expect(success).toBe(true);
    expect(failed).toBe(false);
  });
});

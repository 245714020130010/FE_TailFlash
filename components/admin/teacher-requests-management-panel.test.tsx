import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TeacherRequestsManagementPanel from "@/components/admin/teacher-requests-management-panel";
import type { AdminTeacherRequestData } from "@/lib/api/admin-client";

const pendingRequests: AdminTeacherRequestData[] = [
  {
    teacherProfileId: 11,
    userId: 101,
    email: "teacher@example.com",
    displayName: "Teacher Candidate",
    status: "PENDING",
    submittedAt: "2026-03-28T09:00:00.000Z",
  },
];

describe("TeacherRequestsManagementPanel", () => {
  it("shows loading skeletons while data is loading", () => {
    const { container } = render(
      <TeacherRequestsManagementPanel
        pendingRequests={pendingRequests}
        teacherActionLoadingById={{}}
        isLoading
        onApprove={async () => undefined}
        onReject={async () => true}
        onReload={async () => undefined}
      />
    );

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it("opens reject dialog and submits reason", async () => {
    const user = userEvent.setup();
    const onReject = vi.fn<(teacherProfileId: number, reason: string) => Promise<boolean>>().mockResolvedValue(true);

    render(
      <TeacherRequestsManagementPanel
        pendingRequests={pendingRequests}
        teacherActionLoadingById={{}}
        isLoading={false}
        onApprove={async () => undefined}
        onReject={onReject}
        onReload={async () => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: "Từ chối" }));
    await user.type(screen.getByPlaceholderText("Nhập lý do từ chối"), "Không đủ tiêu chí");
    await user.click(screen.getByRole("button", { name: "Xác nhận từ chối" }));

    await waitFor(() => {
      expect(onReject).toHaveBeenCalledWith(11, "Không đủ tiêu chí");
    });
  });

  it("renders standardized empty-state when no pending requests", () => {
    render(
      <TeacherRequestsManagementPanel
        pendingRequests={[]}
        teacherActionLoadingById={{}}
        isLoading={false}
        onApprove={async () => undefined}
        onReject={async () => true}
        onReload={async () => undefined}
      />
    );

    expect(screen.getByText("Không có yêu cầu đang chờ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tải lại danh sách" })).toBeInTheDocument();
  });
});

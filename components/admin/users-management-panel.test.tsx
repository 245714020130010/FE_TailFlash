import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UsersManagementPanel from "@/components/admin/users-management-panel";
import type { AdminRoleData, AdminUserData } from "@/lib/api/admin-client";

const roles: AdminRoleData[] = [
  {
    id: 1,
    name: "ADMIN",
    description: "Administrator",
    permissionIds: [],
  },
];

const users: AdminUserData[] = [
  {
    id: 101,
    email: "learner@example.com",
    displayName: "Learner",
    role: "LEARNER",
    status: "ACTIVE",
    emailVerified: true,
    createdAt: "2026-03-28T10:00:00.000Z",
    updatedAt: "2026-03-28T10:00:00.000Z",
  },
];

describe("UsersManagementPanel", () => {
  it("shows loading skeletons when table is loading", () => {
    const { container } = render(
      <UsersManagementPanel
        users={users}
        roles={roles}
        keywordFilter=""
        roleFilter="all"
        statusFilter="all"
        userRoleDrafts={{ 101: "LEARNER" }}
        isRefreshingUsers={false}
        isUsersTableLoading
        userActionLoadingById={{}}
        onKeywordFilterChange={() => undefined}
        onRoleFilterChange={() => undefined}
        onStatusFilterChange={() => undefined}
        onUserRoleDraftChange={() => undefined}
        onApplyFilters={async () => undefined}
        onSaveUserRole={async () => undefined}
        onBanUser={async () => undefined}
        onUnbanUser={async () => undefined}
        onResetFilters={async () => undefined}
      />
    );

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it("opens ban confirmation dialog and calls onBanUser only after confirm", async () => {
    const user = userEvent.setup();
    const onBanUser = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    render(
      <UsersManagementPanel
        users={users}
        roles={roles}
        keywordFilter=""
        roleFilter="all"
        statusFilter="all"
        userRoleDrafts={{ 101: "LEARNER" }}
        isRefreshingUsers={false}
        isUsersTableLoading={false}
        userActionLoadingById={{}}
        onKeywordFilterChange={() => undefined}
        onRoleFilterChange={() => undefined}
        onStatusFilterChange={() => undefined}
        onUserRoleDraftChange={() => undefined}
        onApplyFilters={async () => undefined}
        onSaveUserRole={async () => undefined}
        onBanUser={onBanUser}
        onUnbanUser={async () => undefined}
        onResetFilters={async () => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: "Ban" }));

    expect(screen.getByText("Xác nhận khóa tài khoản")).toBeInTheDocument();
    expect(onBanUser).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Xác nhận Ban" }));

    expect(onBanUser).toHaveBeenCalledTimes(1);
    expect(onBanUser).toHaveBeenCalledWith(101);
  });

  it("renders standardized empty-state when users list is empty", () => {
    render(
      <UsersManagementPanel
        users={[]}
        roles={roles}
        keywordFilter="abc"
        roleFilter="all"
        statusFilter="all"
        userRoleDrafts={{}}
        isRefreshingUsers={false}
        isUsersTableLoading={false}
        userActionLoadingById={{}}
        onKeywordFilterChange={() => undefined}
        onRoleFilterChange={() => undefined}
        onStatusFilterChange={() => undefined}
        onUserRoleDraftChange={() => undefined}
        onApplyFilters={async () => undefined}
        onSaveUserRole={async () => undefined}
        onBanUser={async () => undefined}
        onUnbanUser={async () => undefined}
        onResetFilters={async () => undefined}
      />
    );

    expect(screen.getByText("Không có người dùng phù hợp")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa lọc và tải lại" })).toBeInTheDocument();
  });
});

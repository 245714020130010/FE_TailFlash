import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PermissionsManagementPanel from "@/components/admin/permissions-management-panel";
import RolesManagementPanel from "@/components/admin/roles-management-panel";
import type { AdminRoleData, AdminUserData } from "@/lib/api/admin-client";

const roles: AdminRoleData[] = [
  {
    id: 1,
    name: "ADMIN",
    description: "Administrator",
    permissionIds: [1],
  },
];

const users: AdminUserData[] = [
  {
    id: 100,
    email: "admin@example.com",
    displayName: "Admin",
    role: "ADMIN",
    status: "ACTIVE",
    emailVerified: true,
    createdAt: "2026-03-28T10:00:00.000Z",
    updatedAt: "2026-03-28T10:00:00.000Z",
  },
];

describe("Admin Panels Loading States", () => {
  it("renders roles skeleton when roles panel is loading", () => {
    const { container } = render(
      <RolesManagementPanel
        roles={roles}
        roleDrafts={{ 1: { name: "ADMIN", description: "Administrator" } }}
        createRoleName=""
        createRoleDescription=""
        isCreatingRole={false}
        isLoading
        roleSavingById={{}}
        onCreateRoleNameChange={() => undefined}
        onCreateRoleDescriptionChange={() => undefined}
        onRoleDraftChange={() => undefined}
        onCreateRole={async () => undefined}
        onSaveRole={async () => undefined}
        isSystemRole={() => true}
        onReloadRoles={async () => undefined}
      />
    );

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it("renders permissions skeleton when permissions panel is loading", () => {
    const { container } = render(
      <PermissionsManagementPanel
        roles={roles}
        users={users}
        permissionGroups={[]}
        selectedRoleId={1}
        selectedUserId={100}
        rolePermissionIds={[]}
        userPermissionIds={[]}
        isLoading
        isAssigningRolePermissions={false}
        isAssigningUserPermissions={false}
        onSelectRoleId={() => undefined}
        onSelectUserId={() => undefined}
        onToggleRolePermission={() => undefined}
        onToggleUserPermission={() => undefined}
        onAssignRolePermissions={async () => undefined}
        onAssignUserPermissions={async () => undefined}
        onReloadPermissions={async () => undefined}
      />
    );

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });
});

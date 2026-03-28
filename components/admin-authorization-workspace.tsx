"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import PermissionsManagementPanel from "@/components/admin/permissions-management-panel";
import RolesManagementPanel from "@/components/admin/roles-management-panel";
import TeacherRequestsManagementPanel from "@/components/admin/teacher-requests-management-panel";
import UsersManagementPanel from "@/components/admin/users-management-panel";
import { type AdminWorkspaceSection } from "@/components/admin-workspace";
import HeaderThemeToggle from "@/components/header-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type AdminPermissionData,
  type AdminRoleData,
  type AdminTeacherRequestData,
  type AdminUserData,
  adminClient,
  getAdminErrorMessage,
} from "@/lib/api/admin-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/api/auth-client";
import { ApiClientError } from "@/lib/api/types";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";

const SYSTEM_ROLES = new Set(["LEARNER", "TEACHER", "ADMIN"]);

interface UserActionLoadingState {
  [userId: number]: "ban" | "unban" | "role" | undefined;
}

interface AdminAuthorizationWorkspaceProps {
  initialSection?: AdminWorkspaceSection;
}

export default function AdminAuthorizationWorkspace({
  initialSection = "all",
}: AdminAuthorizationWorkspaceProps) {
  const { runOptimistic } = useOptimisticMutation();
  const [isLoading, setIsLoading] = useState(true);
  const [isReloadingData, setIsReloadingData] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [teacherRequests, setTeacherRequests] = useState<AdminTeacherRequestData[]>([]);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [roles, setRoles] = useState<AdminRoleData[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionData[]>([]);

  const [keywordFilter, setKeywordFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  const [roleDrafts, setRoleDrafts] = useState<Record<number, { name: string; description: string }>>({});
  const [userRoleDrafts, setUserRoleDrafts] = useState<Record<number, string>>({});

  const [createRoleName, setCreateRoleName] = useState("");
  const [createRoleDescription, setCreateRoleDescription] = useState("");
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [roleSavingById, setRoleSavingById] = useState<Record<number, boolean>>({});

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [rolePermissionIds, setRolePermissionIds] = useState<number[]>([]);
  const [userPermissionIds, setUserPermissionIds] = useState<number[]>([]);

  const [isAssigningRolePermissions, setIsAssigningRolePermissions] = useState(false);
  const [isAssigningUserPermissions, setIsAssigningUserPermissions] = useState(false);

  const [teacherActionLoadingById, setTeacherActionLoadingById] = useState<Record<number, "approve" | "reject" | undefined>>({});
  const [userActionLoadingById, setUserActionLoadingById] = useState<UserActionLoadingState>({});

  const loadAdminData = useCallback(async () => {
    const roleParam = roleFilter === "all" ? undefined : roleFilter;
    const statusParam = statusFilter === "all" ? undefined : statusFilter;
    const keywordParam = keywordFilter.trim() || undefined;

    const [requests, userList, roleList, permissionList] = await Promise.all([
      adminClient.listTeacherRequests(),
      adminClient.listUsers({ role: roleParam, status: statusParam, keyword: keywordParam }),
      adminClient.listRoles(),
      adminClient.listPermissions(),
    ]);

    setTeacherRequests(requests);
    setUsers(userList);
    setRoles(roleList);
    setPermissions(permissionList);
  }, [keywordFilter, roleFilter, statusFilter]);

  const loadData = useCallback(async (options?: { initial?: boolean }) => {
    const initial = options?.initial ?? false;
    if (initial) {
      setIsLoading(true);
    } else {
      setIsReloadingData(true);
    }

    try {
      const me = await authClient.me();
      setCurrentRole(me.role);

      if (me.role !== "ADMIN") {
        setTeacherRequests([]);
        setUsers([]);
        setRoles([]);
        setPermissions([]);
        return;
      }

      await loadAdminData();
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("loadAdminData", error));
      } else {
        toast.error("Không thể tải dữ liệu admin");
      }
    } finally {
      if (initial) {
        setIsLoading(false);
      } else {
        setIsReloadingData(false);
      }
    }
  }, [loadAdminData]);

  useEffect(() => {
    void loadData({ initial: true });
  }, [loadData]);

  const pendingRequests = useMemo(
    () =>
      teacherRequests.filter(
        (item) => item.status === "PENDING" || Boolean(teacherActionLoadingById[item.teacherProfileId])
      ),
    [teacherActionLoadingById, teacherRequests]
  );

  const approvedCount = useMemo(
    () => teacherRequests.filter((item) => item.status === "APPROVED").length,
    [teacherRequests]
  );

  const rejectedCount = useMemo(
    () => teacherRequests.filter((item) => item.status === "REJECTED").length,
    [teacherRequests]
  );

  useEffect(() => {
    setRoleDrafts((prev) => {
      const next = { ...prev };
      for (const role of roles) {
        if (!next[role.id]) {
          next[role.id] = {
            name: role.name,
            description: role.description ?? "",
          };
        }
      }
      return next;
    });

    setUserRoleDrafts((prev) => {
      const next = { ...prev };
      for (const user of users) {
        if (!next[user.id]) {
          next[user.id] = user.role;
        }
      }
      return next;
    });

    if (selectedRoleId === null && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }

    if (selectedUserId === null && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [roles, users, selectedRoleId, selectedUserId]);

  useEffect(() => {
    if (selectedRoleId === null) {
      setRolePermissionIds([]);
      return;
    }

    const selectedRole = roles.find((role) => role.id === selectedRoleId);
    if (!selectedRole) {
      setRolePermissionIds([]);
      return;
    }

    setRolePermissionIds(selectedRole.permissionIds);
  }, [roles, selectedRoleId]);

  useEffect(() => {
    if (selectedUserId === null || currentRole !== "ADMIN") {
      setUserPermissionIds([]);
      return;
    }

    const loadSelectedUserPermissions = async () => {
      try {
        const result = await adminClient.getUserPermissions(selectedUserId);
        setUserPermissionIds(result.userPermissionIds);
      } catch (error) {
        if (error instanceof ApiClientError) {
          toast.error(getAdminErrorMessage("getUserPermissions", error));
          return;
        }
        toast.error("Không thể tải quyền riêng của người dùng.");
      }
    };

    void loadSelectedUserPermissions();
  }, [currentRole, selectedUserId]);

  const setTeacherRowLoading = useCallback((teacherProfileId: number, action?: "approve" | "reject") => {
    setTeacherActionLoadingById((prev) => ({
      ...prev,
      [teacherProfileId]: action,
    }));
  }, []);

  const setUserRowLoading = useCallback((userId: number, action?: "ban" | "unban" | "role") => {
    setUserActionLoadingById((prev) => ({
      ...prev,
      [userId]: action,
    }));
  }, []);

  const handleApprove = async (teacherProfileId: number) => {
    const optimisticReviewedAt = new Date().toISOString();
    setTeacherRowLoading(teacherProfileId, "approve");

    await runOptimistic({
      captureSnapshot: () => teacherRequests,
      applyOptimistic: () => {
        setTeacherRequests((prev) =>
          prev.map((request) =>
            request.teacherProfileId === teacherProfileId
              ? {
                  ...request,
                  status: "APPROVED",
                  reviewedAt: optimisticReviewedAt,
                  rejectReason: undefined,
                }
              : request
          )
        );
      },
      request: async () => {
        await adminClient.approveTeacherRequest(teacherProfileId);
      },
      rollback: (snapshot) => {
        setTeacherRequests(snapshot);
      },
      onSuccess: () => {
        toast.success("Đã duyệt yêu cầu giáo viên");
        void loadAdminData().catch(() => undefined);
      },
      onError: (error) => {
        if (error instanceof ApiClientError) {
          toast.error(getAdminErrorMessage("approveTeacherRequest", error));
          return;
        }
        toast.error("Không thể duyệt yêu cầu");
      },
      onSettled: () => {
        setTeacherRowLoading(teacherProfileId);
      },
      minimumPendingMs: 220,
    });
  };

  const handleReject = async (teacherProfileId: number, reason: string): Promise<boolean> => {
    const optimisticReviewedAt = new Date().toISOString();
    setTeacherRowLoading(teacherProfileId, "reject");

    return runOptimistic({
      captureSnapshot: () => teacherRequests,
      applyOptimistic: () => {
        setTeacherRequests((prev) =>
          prev.map((request) =>
            request.teacherProfileId === teacherProfileId
              ? {
                  ...request,
                  status: "REJECTED",
                  reviewedAt: optimisticReviewedAt,
                  rejectReason: reason,
                }
              : request
          )
        );
      },
      request: async () => {
        await adminClient.rejectTeacherRequest(teacherProfileId, reason);
      },
      rollback: (snapshot) => {
        setTeacherRequests(snapshot);
      },
      onSuccess: () => {
        toast.success("Đã từ chối yêu cầu giáo viên");
        void loadAdminData().catch(() => undefined);
      },
      onError: (error) => {
        if (error instanceof ApiClientError) {
          toast.error(getAdminErrorMessage("rejectTeacherRequest", error));
          return;
        }
        toast.error("Không thể từ chối yêu cầu");
      },
      onSettled: () => {
        setTeacherRowLoading(teacherProfileId);
      },
      minimumPendingMs: 220,
    });
  };

  const handleApplyUserFilters = async () => {
    try {
      setIsRefreshingUsers(true);
      const nextUsers = await adminClient.listUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        keyword: keywordFilter.trim() || undefined,
      });
      setUsers(nextUsers);
      toast.success("Đã cập nhật danh sách người dùng.");
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("listUsers", error));
        return;
      }
      toast.error("Không thể lọc danh sách người dùng.");
    } finally {
      setIsRefreshingUsers(false);
    }
  };

  const handleBanUser = async (userId: number) => {
    setUserRowLoading(userId, "ban");

    await runOptimistic({
      captureSnapshot: () => users,
      applyOptimistic: () => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: "SUSPENDED",
                }
              : user
          )
        );
      },
      request: async () => {
        await adminClient.banUser(userId);
      },
      rollback: (snapshot) => {
        setUsers(snapshot);
      },
      onSuccess: () => {
        toast.success("Đã khóa tài khoản.");
        void loadAdminData().catch(() => undefined);
      },
      onError: (error) => {
        if (error instanceof ApiClientError) {
          toast.error(getAdminErrorMessage("banUser", error));
          return;
        }
        toast.error("Không thể khóa tài khoản.");
      },
      onSettled: () => {
        setUserRowLoading(userId);
      },
      minimumPendingMs: 180,
    });
  };

  const handleUnbanUser = async (userId: number) => {
    setUserRowLoading(userId, "unban");

    await runOptimistic({
      captureSnapshot: () => users,
      applyOptimistic: () => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: "ACTIVE",
                }
              : user
          )
        );
      },
      request: async () => {
        await adminClient.unbanUser(userId);
      },
      rollback: (snapshot) => {
        setUsers(snapshot);
      },
      onSuccess: () => {
        toast.success("Đã mở khóa tài khoản.");
        void loadAdminData().catch(() => undefined);
      },
      onError: (error) => {
        if (error instanceof ApiClientError) {
          toast.error(getAdminErrorMessage("unbanUser", error));
          return;
        }
        toast.error("Không thể mở khóa tài khoản.");
      },
      onSettled: () => {
        setUserRowLoading(userId);
      },
      minimumPendingMs: 180,
    });
  };

  const handleChangeUserRole = async (userId: number) => {
    const roleName = userRoleDrafts[userId]?.trim();
    if (!roleName) {
      toast.error("Vai trò không hợp lệ.");
      return;
    }

    try {
      setUserRowLoading(userId, "role");
      await adminClient.changeUserRole(userId, roleName);
      toast.success("Đã cập nhật vai trò người dùng.");
      await loadData();
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("changeUserRole", error));
        return;
      }
      toast.error("Không thể cập nhật vai trò người dùng.");
    } finally {
      setUserRowLoading(userId);
    }
  };

  const handleResetUserFilters = async () => {
    try {
      setIsRefreshingUsers(true);
      setKeywordFilter("");
      setRoleFilter("all");
      setStatusFilter("all");

      const nextUsers = await adminClient.listUsers();
      setUsers(nextUsers);
      toast.success("Đã xóa bộ lọc và tải lại danh sách người dùng.");
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("listUsers", error));
        return;
      }
      toast.error("Không thể tải lại danh sách người dùng.");
    } finally {
      setIsRefreshingUsers(false);
    }
  };

  const handleCreateRole = async () => {
    const roleName = createRoleName.trim();
    if (!roleName) {
      toast.error("Tên vai trò là bắt buộc.");
      return;
    }

    try {
      setIsCreatingRole(true);
      await adminClient.createRole(roleName, createRoleDescription.trim() || undefined);
      toast.success("Đã tạo vai trò mới.");
      setCreateRoleName("");
      setCreateRoleDescription("");
      await loadData();
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("createRole", error));
        return;
      }
      toast.error("Không thể tạo vai trò mới.");
    } finally {
      setIsCreatingRole(false);
    }
  };

  const handleSaveRole = async (role: AdminRoleData) => {
    const draft = roleDrafts[role.id];
    if (!draft) {
      return;
    }

    const isSystemRole = SYSTEM_ROLES.has(role.name);
    const trimmedDescription = draft.description.trim();

    if (!isSystemRole && !draft.name.trim()) {
      toast.error("Tên vai trò là bắt buộc.");
      return;
    }

    try {
      setRoleSavingById((prev) => ({ ...prev, [role.id]: true }));
      await adminClient.updateRole(role.id, {
        name: isSystemRole ? undefined : draft.name.trim(),
        description: trimmedDescription || undefined,
      });
      toast.success(`Đã cập nhật vai trò ${role.name}.`);
      await loadData();
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("updateRole", error));
        return;
      }
      toast.error("Không thể cập nhật vai trò.");
    } finally {
      setRoleSavingById((prev) => ({ ...prev, [role.id]: false }));
    }
  };

  const togglePermission = useCallback((current: number[], permissionId: number) => {
    if (current.includes(permissionId)) {
      return current.filter((id) => id !== permissionId);
    }
    return [...current, permissionId].sort((left, right) => left - right);
  }, []);

  const handleAssignRolePermissions = async () => {
    if (selectedRoleId === null) {
      toast.error("Vui lòng chọn vai trò.");
      return;
    }

    try {
      setIsAssigningRolePermissions(true);
      await adminClient.assignRolePermissions(selectedRoleId, rolePermissionIds);
      toast.success("Đã cập nhật quyền cho vai trò.");
      await loadData();
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("assignRolePermissions", error));
        return;
      }
      toast.error("Không thể cập nhật quyền cho vai trò.");
    } finally {
      setIsAssigningRolePermissions(false);
    }
  };

  const handleAssignUserPermissions = async () => {
    if (selectedUserId === null) {
      toast.error("Vui lòng chọn người dùng.");
      return;
    }

    try {
      setIsAssigningUserPermissions(true);
      await adminClient.assignUserPermissions(selectedUserId, userPermissionIds);
      toast.success("Đã cập nhật quyền riêng cho người dùng.");
      await loadData();
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(getAdminErrorMessage("assignUserPermissions", error));
        return;
      }
      toast.error("Không thể cập nhật quyền riêng cho người dùng.");
    } finally {
      setIsAssigningUserPermissions(false);
    }
  };

  const permissionGroups = useMemo(() => {
    const grouped = new Map<string, AdminPermissionData[]>();
    for (const permission of permissions) {
      const current = grouped.get(permission.group) ?? [];
      current.push(permission);
      grouped.set(permission.group, current);
    }
    return Array.from(grouped.entries()).sort((left, right) => left[0].localeCompare(right[0]));
  }, [permissions]);

  const initialTab = useMemo(() => {
    if (initialSection === "moderation") {
      return "teacher-requests";
    }
    if (initialSection === "reports") {
      return "permissions";
    }
    return "users";
  }, [initialSection]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Admin Workspace</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Đang tải dữ liệu quản trị...</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (currentRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Không có quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">Tài khoản hiện tại không có quyền quản trị hệ thống.</p>
              <Link href="/dashboard">
                <Button variant="outline">Quay về Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Workspace</h1>
            <p className="text-sm text-muted-foreground">Quản lý duyệt yêu cầu giáo viên</p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            <Button variant="outline" onClick={() => void loadData()}>
              {isReloadingData ? "Đang tải..." : "Tải lại"}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-6 px-4 py-8 sm:max-w-6xl sm:px-6">
        <section className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Yêu cầu đang chờ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Đã duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Đã từ chối</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{rejectedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="teacher-requests">Teacher Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersManagementPanel
              users={users}
              roles={roles}
              keywordFilter={keywordFilter}
              roleFilter={roleFilter}
              statusFilter={statusFilter}
              userRoleDrafts={userRoleDrafts}
              isRefreshingUsers={isRefreshingUsers}
              isUsersTableLoading={isRefreshingUsers || isReloadingData}
              userActionLoadingById={userActionLoadingById}
              onKeywordFilterChange={setKeywordFilter}
              onRoleFilterChange={setRoleFilter}
              onStatusFilterChange={setStatusFilter}
              onUserRoleDraftChange={(userId, roleName) =>
                setUserRoleDrafts((prev) => ({
                  ...prev,
                  [userId]: roleName,
                }))
              }
              onApplyFilters={handleApplyUserFilters}
              onSaveUserRole={handleChangeUserRole}
              onBanUser={handleBanUser}
              onUnbanUser={handleUnbanUser}
              onResetFilters={handleResetUserFilters}
            />
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <RolesManagementPanel
              roles={roles}
              roleDrafts={roleDrafts}
              createRoleName={createRoleName}
              createRoleDescription={createRoleDescription}
              isCreatingRole={isCreatingRole}
              isLoading={isReloadingData}
              roleSavingById={roleSavingById}
              onCreateRoleNameChange={setCreateRoleName}
              onCreateRoleDescriptionChange={setCreateRoleDescription}
              onRoleDraftChange={(roleId, nextValue) =>
                setRoleDrafts((prev) => ({
                  ...prev,
                  [roleId]: nextValue,
                }))
              }
              onCreateRole={handleCreateRole}
              onSaveRole={handleSaveRole}
              isSystemRole={(roleName) => SYSTEM_ROLES.has(roleName)}
              onReloadRoles={async () => {
                await loadData();
              }}
            />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <PermissionsManagementPanel
              roles={roles}
              users={users}
              permissionGroups={permissionGroups}
              selectedRoleId={selectedRoleId}
              selectedUserId={selectedUserId}
              rolePermissionIds={rolePermissionIds}
              userPermissionIds={userPermissionIds}
              isLoading={isReloadingData}
              isAssigningRolePermissions={isAssigningRolePermissions}
              isAssigningUserPermissions={isAssigningUserPermissions}
              onSelectRoleId={setSelectedRoleId}
              onSelectUserId={setSelectedUserId}
              onToggleRolePermission={(permissionId) =>
                setRolePermissionIds((prev) => togglePermission(prev, permissionId))
              }
              onToggleUserPermission={(permissionId) =>
                setUserPermissionIds((prev) => togglePermission(prev, permissionId))
              }
              onAssignRolePermissions={handleAssignRolePermissions}
              onAssignUserPermissions={handleAssignUserPermissions}
              onReloadPermissions={async () => {
                await loadData();
              }}
            />
          </TabsContent>

          <TabsContent value="teacher-requests">
            <TeacherRequestsManagementPanel
              pendingRequests={pendingRequests}
              teacherActionLoadingById={teacherActionLoadingById}
              isLoading={isReloadingData}
              onApprove={handleApprove}
              onReject={handleReject}
              onReload={async () => {
                await loadData();
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

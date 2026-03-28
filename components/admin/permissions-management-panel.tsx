"use client";

import { KeyRound, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminPermissionData, AdminRoleData, AdminUserData } from "@/lib/api/admin-client";

interface PermissionsManagementPanelProps {
  roles: AdminRoleData[];
  users: AdminUserData[];
  permissionGroups: Array<[string, AdminPermissionData[]]>;
  selectedRoleId: number | null;
  selectedUserId: number | null;
  rolePermissionIds: number[];
  userPermissionIds: number[];
  isLoading: boolean;
  isAssigningRolePermissions: boolean;
  isAssigningUserPermissions: boolean;
  onSelectRoleId: (roleId: number) => void;
  onSelectUserId: (userId: number) => void;
  onToggleRolePermission: (permissionId: number) => void;
  onToggleUserPermission: (permissionId: number) => void;
  onAssignRolePermissions: () => Promise<void>;
  onAssignUserPermissions: () => Promise<void>;
  onReloadPermissions: () => Promise<void>;
}

export default function PermissionsManagementPanel({
  roles,
  users,
  permissionGroups,
  selectedRoleId,
  selectedUserId,
  rolePermissionIds,
  userPermissionIds,
  isLoading,
  isAssigningRolePermissions,
  isAssigningUserPermissions,
  onSelectRoleId,
  onSelectUserId,
  onToggleRolePermission,
  onToggleUserPermission,
  onAssignRolePermissions,
  onAssignUserPermissions,
  onReloadPermissions,
}: PermissionsManagementPanelProps) {
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const hasRoleOrUser = roles.length > 0 || users.length > 0;
  const hasPermissionGroups = permissionGroups.length > 0;

  if (isLoading) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Phân quyền theo role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full sm:w-[320px]" />
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-md border p-3">
                <Skeleton className="h-4 w-36" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            ))}
            <Skeleton className="h-9 w-40" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân quyền riêng theo user</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full sm:w-[420px]" />
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`user-skeleton-${index}`} className="space-y-2 rounded-md border p-3">
                <Skeleton className="h-4 w-36" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            ))}
            <Skeleton className="h-9 w-52" />
          </CardContent>
        </Card>
      </>
    );
  }

  if (!hasRoleOrUser || !hasPermissionGroups) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân quyền</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty className="border rounded-md">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyRound className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Chưa đủ dữ liệu để phân quyền</EmptyTitle>
              <EmptyDescription>
                Cần có vai trò, người dùng và danh sách quyền để thực hiện gán quyền. Vui lòng tải lại dữ liệu.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => void onReloadPermissions()}>
                <RefreshCcw className="mr-2 size-4" />
                Tải lại dữ liệu
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Phân quyền theo role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={selectedRoleId === null ? undefined : String(selectedRoleId)}
            onValueChange={(value) => onSelectRoleId(Number(value))}
            disabled={isAssigningRolePermissions}
          >
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder="Chọn role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRole ? (
            <p className="text-sm text-muted-foreground">
              Đang chỉnh quyền cho role: <span className="font-semibold text-foreground">{selectedRole.name}</span>
            </p>
          ) : null}

          {permissionGroups.map(([groupName, groupedPermissions]) => (
            <div key={groupName} className="rounded-md border p-3">
              <p className="mb-2 text-sm font-semibold">{groupName}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {groupedPermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rolePermissionIds.includes(permission.id)}
                      onChange={() => onToggleRolePermission(permission.id)}
                      disabled={isAssigningRolePermissions}
                    />
                    <span>
                      <span className="font-medium">{permission.name}</span>
                      <span className="block text-muted-foreground">{permission.description ?? "Không có mô tả"}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <Button disabled={isAssigningRolePermissions} onClick={() => void onAssignRolePermissions()}>
            {isAssigningRolePermissions ? "Đang lưu..." : "Lưu quyền cho role"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phân quyền riêng theo user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={selectedUserId === null ? undefined : String(selectedUserId)}
            onValueChange={(value) => onSelectUserId(Number(value))}
            disabled={isAssigningUserPermissions}
          >
            <SelectTrigger className="w-full sm:w-[420px]">
              <SelectValue placeholder="Chọn người dùng" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.email} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedUser ? (
            <p className="text-sm text-muted-foreground">
              Quyền riêng cho: <span className="font-semibold text-foreground">{selectedUser.email}</span>
            </p>
          ) : null}

          {permissionGroups.map(([groupName, groupedPermissions]) => (
            <div key={`user-${groupName}`} className="rounded-md border p-3">
              <p className="mb-2 text-sm font-semibold">{groupName}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {groupedPermissions.map((permission) => (
                  <label key={`user-permission-${permission.id}`} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                    <input
                      type="checkbox"
                      checked={userPermissionIds.includes(permission.id)}
                      onChange={() => onToggleUserPermission(permission.id)}
                      disabled={isAssigningUserPermissions}
                    />
                    <span>
                      <span className="font-medium">{permission.name}</span>
                      <span className="block text-muted-foreground">{permission.description ?? "Không có mô tả"}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <Button disabled={isAssigningUserPermissions} onClick={() => void onAssignUserPermissions()}>
            {isAssigningUserPermissions ? "Đang lưu..." : "Lưu quyền riêng cho user"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

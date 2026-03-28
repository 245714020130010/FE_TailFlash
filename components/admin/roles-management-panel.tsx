"use client";

import { ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { AdminRoleData } from "@/lib/api/admin-client";

interface RolesManagementPanelProps {
  roles: AdminRoleData[];
  roleDrafts: Record<number, { name: string; description: string }>;
  createRoleName: string;
  createRoleDescription: string;
  isCreatingRole: boolean;
  isLoading: boolean;
  roleSavingById: Record<number, boolean>;
  onCreateRoleNameChange: (value: string) => void;
  onCreateRoleDescriptionChange: (value: string) => void;
  onRoleDraftChange: (roleId: number, nextValue: { name: string; description: string }) => void;
  onCreateRole: () => Promise<void>;
  onSaveRole: (role: AdminRoleData) => Promise<void>;
  isSystemRole: (roleName: string) => boolean;
  onReloadRoles: () => Promise<void>;
}

export default function RolesManagementPanel({
  roles,
  roleDrafts,
  createRoleName,
  createRoleDescription,
  isCreatingRole,
  isLoading,
  roleSavingById,
  onCreateRoleNameChange,
  onCreateRoleDescriptionChange,
  onRoleDraftChange,
  onCreateRole,
  onSaveRole,
  isSystemRole,
  onReloadRoles,
}: RolesManagementPanelProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tạo vai trò mới</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input
            placeholder="Tên vai trò (VD: CONTENT_MODERATOR)"
            value={createRoleName}
            onChange={(event) => onCreateRoleNameChange(event.target.value)}
            disabled={isCreatingRole}
          />
          <Textarea
            placeholder="Mô tả vai trò"
            value={createRoleDescription}
            onChange={(event) => onCreateRoleDescriptionChange(event.target.value)}
            disabled={isCreatingRole}
          />
          <div>
            <Button onClick={() => void onCreateRole()} disabled={isCreatingRole}>
              {isCreatingRole ? "Đang tạo..." : "Tạo role"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa vai trò</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-md border p-4">
                <Skeleton className="h-5 w-40" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-20" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            ))
          ) : roles.length === 0 ? (
            <Empty className="border rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldOff className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có vai trò nào</EmptyTitle>
                <EmptyDescription>
                  Danh sách vai trò đang trống. Bạn có thể tạo vai trò mới hoặc tải lại để đồng bộ dữ liệu.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => void onReloadRoles()}>
                  Tải lại vai trò
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            roles.map((role) => {
              const systemRole = isSystemRole(role.name);
              const draft = roleDrafts[role.id] ?? {
                name: role.name,
                description: role.description ?? "",
              };
              const isSaving = roleSavingById[role.id] === true;

              return (
                <div key={role.id} className="rounded-md border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <p className="font-semibold">{role.name}</p>
                    {systemRole ? <Badge variant="outline">SYSTEM</Badge> : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={draft.name}
                      disabled={systemRole || isSaving}
                      onChange={(event) =>
                        onRoleDraftChange(role.id, {
                          ...draft,
                          name: event.target.value,
                        })
                      }
                    />
                    <Textarea
                      value={draft.description}
                      disabled={isSaving}
                      onChange={(event) =>
                        onRoleDraftChange(role.id, {
                          ...draft,
                          description: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" onClick={() => void onSaveRole(role)} disabled={isSaving}>
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </>
  );
}

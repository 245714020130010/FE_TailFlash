"use client";

import { useMemo, useState } from "react";
import { SearchX, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminRoleData, AdminUserData } from "@/lib/api/admin-client";
import { cn } from "@/lib/utils";

interface UsersManagementPanelProps {
  users: AdminUserData[];
  roles: AdminRoleData[];
  keywordFilter: string;
  roleFilter: string;
  statusFilter: string;
  userRoleDrafts: Record<number, string>;
  isRefreshingUsers: boolean;
  isUsersTableLoading: boolean;
  userActionLoadingById: Record<number, "ban" | "unban" | "role" | undefined>;
  onKeywordFilterChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUserRoleDraftChange: (userId: number, roleName: string) => void;
  onApplyFilters: () => Promise<void>;
  onSaveUserRole: (userId: number) => Promise<void>;
  onBanUser: (userId: number) => Promise<void>;
  onUnbanUser: (userId: number) => Promise<void>;
  onResetFilters: () => Promise<void>;
}

export default function UsersManagementPanel({
  users,
  roles,
  keywordFilter,
  roleFilter,
  statusFilter,
  userRoleDrafts,
  isRefreshingUsers,
  isUsersTableLoading,
  userActionLoadingById,
  onKeywordFilterChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onUserRoleDraftChange,
  onApplyFilters,
  onSaveUserRole,
  onBanUser,
  onUnbanUser,
  onResetFilters,
}: UsersManagementPanelProps) {
  const [confirmBanUserId, setConfirmBanUserId] = useState<number | null>(null);

  const confirmBanUser = useMemo(
    () => users.find((user) => user.id === confirmBanUserId) ?? null,
    [users, confirmBanUserId]
  );

  const isConfirmingBan =
    confirmBanUserId !== null && userActionLoadingById[confirmBanUserId] === "ban";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc người dùng</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input
            value={keywordFilter}
            onChange={(event) => onKeywordFilterChange(event.target.value)}
            placeholder="Tìm theo email hoặc tên"
            disabled={isRefreshingUsers}
          />
          <Select value={roleFilter} onValueChange={onRoleFilterChange} disabled={isRefreshingUsers}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange} disabled={isRefreshingUsers}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => void onApplyFilters()} disabled={isRefreshingUsers}>
            {isRefreshingUsers ? "Đang lọc..." : "Áp dụng bộ lọc"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          {isUsersTableLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-5 gap-2">
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <Empty className="border rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có người dùng phù hợp</EmptyTitle>
                <EmptyDescription>
                  Không có kết quả nào khớp với bộ lọc hiện tại. Hãy thử đổi điều kiện lọc hoặc tải lại danh sách.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => void onResetFilters()}>
                  <SearchX className="mr-2 size-4" />
                  Xóa lọc và tải lại
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const currentAction = userActionLoadingById[user.id];
                  const isBusy = Boolean(currentAction);

                  return (
                    <TableRow key={user.id} className={cn("transition-colors duration-300", isBusy && "bg-muted/30") }>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>
                        <Select
                          value={userRoleDrafts[user.id] ?? user.role}
                          onValueChange={(value) => onUserRoleDraftChange(user.id, value)}
                          disabled={isBusy}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "SUSPENDED" ? "destructive" : "secondary"}
                          className={cn(
                            "transition-all duration-300",
                            (currentAction === "ban" || currentAction === "unban") && "animate-pulse"
                          )}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => void onSaveUserRole(user.id)} disabled={isBusy}>
                            {currentAction === "role" ? "Đang lưu..." : "Lưu role"}
                          </Button>
                          {user.status === "SUSPENDED" ? (
                            <Button size="sm" onClick={() => void onUnbanUser(user.id)} disabled={isBusy}>
                              {currentAction === "unban" ? "Đang mở..." : "Unban"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setConfirmBanUserId(user.id)}
                              disabled={isBusy}
                            >
                              {currentAction === "ban" ? "Đang khóa..." : "Ban"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmBanUserId !== null}
        onOpenChange={(open) => {
          if (!open && !isConfirmingBan) {
            setConfirmBanUserId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khóa tài khoản {confirmBanUser?.email ?? "người dùng này"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirmingBan}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isConfirmingBan || confirmBanUserId === null}
              onClick={(event) => {
                event.preventDefault();
                if (confirmBanUserId === null) {
                  return;
                }

                void onBanUser(confirmBanUserId)
                  .then(() => {
                    setConfirmBanUserId(null);
                  })
                  .catch(() => undefined);
              }}
            >
              {isConfirmingBan ? "Đang khóa..." : "Xác nhận Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

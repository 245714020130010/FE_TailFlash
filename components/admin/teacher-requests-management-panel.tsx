"use client";

import { useState } from "react";
import { GraduationCap, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { AdminTeacherRequestData } from "@/lib/api/admin-client";
import { cn } from "@/lib/utils";

interface RejectTeacherDialogState {
  open: boolean;
  teacherProfileId: number | null;
  displayName: string;
}

interface TeacherRequestsManagementPanelProps {
  pendingRequests: AdminTeacherRequestData[];
  teacherActionLoadingById: Record<number, "approve" | "reject" | undefined>;
  isLoading: boolean;
  onApprove: (teacherProfileId: number) => Promise<void>;
  onReject: (teacherProfileId: number, reason: string) => Promise<boolean>;
  onReload: () => Promise<void>;
}

export default function TeacherRequestsManagementPanel({
  pendingRequests,
  teacherActionLoadingById,
  isLoading,
  onApprove,
  onReject,
  onReload,
}: TeacherRequestsManagementPanelProps) {
  const [rejectDialog, setRejectDialog] = useState<RejectTeacherDialogState>({
    open: false,
    teacherProfileId: null,
    displayName: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const openRejectDialog = (teacherProfileId: number, displayName: string) => {
    setRejectReason("");
    setRejectDialog({
      open: true,
      teacherProfileId,
      displayName,
    });
  };

  const closeRejectDialog = () => {
    setRejectDialog({
      open: false,
      teacherProfileId: null,
      displayName: "",
    });
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (rejectDialog.teacherProfileId === null) {
      return;
    }

    const reason = rejectReason.trim();
    if (reason.length < 3) {
      toast.error("Lý do từ chối phải có ít nhất 3 ký tự");
      return;
    }

    const success = await onReject(rejectDialog.teacherProfileId, reason);
    if (success) {
      closeRejectDialog();
    }
  };

  const rejectBusy =
    rejectDialog.teacherProfileId !== null
    && teacherActionLoadingById[rejectDialog.teacherProfileId] === "reject";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Teacher Approval Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-md border p-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-56" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))
          ) : pendingRequests.length === 0 ? (
            <Empty className="border rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <GraduationCap className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có yêu cầu đang chờ</EmptyTitle>
                <EmptyDescription>
                  Hiện tại chưa có yêu cầu giáo viên nào cần xử lý. Bạn có thể tải lại để kiểm tra dữ liệu mới nhất.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => void onReload()}>
                  <RefreshCcw className="mr-2 size-4" />
                  Tải lại danh sách
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            pendingRequests.map((request) => {
              const currentAction = teacherActionLoadingById[request.teacherProfileId];
              const isBusy = Boolean(currentAction);

              return (
                <div
                  key={request.teacherProfileId}
                  className={cn(
                    "rounded-md border bg-card/70 p-4 text-sm transition-all duration-300",
                    isBusy && "opacity-80 ring-1 ring-primary/30"
                  )}
                >
                  <p className="font-semibold">{request.displayName}</p>
                  <p className="text-muted-foreground">{request.email}</p>
                  <p className="text-muted-foreground">
                    Gửi lúc: {new Date(request.submittedAt).toLocaleString("vi-VN")}
                  </p>
                  <div className="mt-2">
                    <Badge
                      variant={request.status === "PENDING" ? "secondary" : "outline"}
                      className={cn("transition-all duration-300", isBusy && "animate-pulse")}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => void onApprove(request.teacherProfileId)} disabled={isBusy}>
                      {currentAction === "approve" ? "Đang duyệt..." : "Duyệt"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openRejectDialog(request.teacherProfileId, request.displayName)}
                      disabled={isBusy}
                    >
                      {currentAction === "reject" ? "Đang từ chối..." : "Từ chối"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && !rejectBusy && closeRejectDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu giáo viên</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối cho {rejectDialog.displayName || "người dùng"}. Lý do phải có ít nhất 3 ký tự.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Nhập lý do từ chối"
            rows={4}
            disabled={rejectBusy}
          />

          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog} disabled={rejectBusy}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void handleConfirmReject()} disabled={rejectBusy}>
              {rejectBusy ? "Đang từ chối..." : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

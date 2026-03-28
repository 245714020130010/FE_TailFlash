import { getAccessToken } from "@/lib/api/auth-session";
import { requestJson } from "@/lib/api/http-client";
import { ApiClientError, type MessageData } from "@/lib/api/types";

export interface AdminTeacherRequestData {
  teacherProfileId: number;
  userId: number;
  email: string;
  displayName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface AdminUserData {
  id: number;
  email: string;
  displayName: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRoleData {
  id: number;
  name: string;
  description?: string;
  permissionIds: number[];
}

export interface AdminPermissionData {
  id: number;
  name: string;
  group: string;
  description?: string;
}

export interface AdminUserPermissionsData {
  userId: number;
  rolePermissionIds: number[];
  userPermissionIds: number[];
  effectivePermissionIds: number[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export type AdminErrorAction =
  | "loadAdminData"
  | "listTeacherRequests"
  | "approveTeacherRequest"
  | "rejectTeacherRequest"
  | "listUsers"
  | "banUser"
  | "unbanUser"
  | "changeUserRole"
  | "listRoles"
  | "createRole"
  | "updateRole"
  | "listPermissions"
  | "assignRolePermissions"
  | "getUserPermissions"
  | "assignUserPermissions";

const ADMIN_ERROR_MESSAGES: Partial<Record<AdminErrorAction, Partial<Record<string, string>>>> = {
  loadAdminData: {
    AUTH_UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
    AUTH_FORBIDDEN: "Bạn không có quyền truy cập khu vực quản trị.",
  },
  approveTeacherRequest: {
    TEACHER_REQUEST_NOT_FOUND: "Không tìm thấy yêu cầu giáo viên.",
    TEACHER_REQUEST_ALREADY_REVIEWED: "Yêu cầu này đã được xử lý trước đó.",
  },
  rejectTeacherRequest: {
    TEACHER_REQUEST_NOT_FOUND: "Không tìm thấy yêu cầu giáo viên.",
    TEACHER_REQUEST_ALREADY_REVIEWED: "Yêu cầu này đã được xử lý trước đó.",
  },
  banUser: {
    ADMIN_SELF_BAN_NOT_ALLOWED: "Bạn không thể tự khóa chính mình.",
    USER_NOT_FOUND: "Không tìm thấy người dùng cần khóa.",
  },
  unbanUser: {
    USER_NOT_FOUND: "Không tìm thấy người dùng cần mở khóa.",
  },
  changeUserRole: {
    ADMIN_SELF_ROLE_CHANGE_NOT_ALLOWED: "Bạn không thể tự đổi vai trò của chính mình.",
    ADMIN_ROLE_NOT_FOUND: "Vai trò được chọn không tồn tại.",
    USER_NOT_FOUND: "Không tìm thấy người dùng cần đổi vai trò.",
  },
  createRole: {
    ADMIN_ROLE_ALREADY_EXISTS: "Tên vai trò đã tồn tại.",
  },
  updateRole: {
    ADMIN_ROLE_NOT_FOUND: "Không tìm thấy vai trò cần cập nhật.",
    ADMIN_ROLE_ALREADY_EXISTS: "Tên vai trò đã tồn tại.",
    ADMIN_SYSTEM_ROLE_RENAME_FORBIDDEN: "Vai trò hệ thống chỉ được sửa mô tả, không được đổi tên.",
  },
  assignRolePermissions: {
    ADMIN_ROLE_NOT_FOUND: "Không tìm thấy vai trò cần phân quyền.",
    ADMIN_PERMISSION_NOT_FOUND: "Có quyền hạn không tồn tại.",
    ADMIN_PERMISSION_IDS_REQUIRED: "Danh sách quyền hạn là bắt buộc.",
  },
  getUserPermissions: {
    USER_NOT_FOUND: "Không tìm thấy người dùng.",
  },
  assignUserPermissions: {
    USER_NOT_FOUND: "Không tìm thấy người dùng để gán quyền.",
    ADMIN_PERMISSION_NOT_FOUND: "Có quyền hạn không tồn tại.",
    ADMIN_PERMISSION_IDS_REQUIRED: "Danh sách quyền hạn là bắt buộc.",
  },
};

const COMMON_ADMIN_ERROR_MESSAGES: Partial<Record<string, string>> = {
  AUTH_FORBIDDEN: "Bạn không có quyền quản trị.",
  AUTH_UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
};

export function getAdminErrorMessage(action: AdminErrorAction, error: ApiClientError): string {
  const actionMessage = ADMIN_ERROR_MESSAGES[action]?.[error.code];
  if (actionMessage) {
    return actionMessage;
  }

  const commonMessage = COMMON_ADMIN_ERROR_MESSAGES[error.code];
  if (commonMessage) {
    return commonMessage;
  }

  return error.message || "Có lỗi xảy ra ở khu vực quản trị.";
}

export const adminClient = {
  async listTeacherRequests(status?: "PENDING" | "APPROVED" | "REJECTED") {
    const accessToken = getAccessToken();
    const query = status ? `?status=${status}` : "";
    return requestJson<AdminTeacherRequestData[]>(`/api/v1/admin/teacher-requests${query}`, {
      method: "GET",
      accessToken,
    });
  },

  async approveTeacherRequest(teacherProfileId: number) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/teacher-requests/${teacherProfileId}/approve`, {
      method: "PUT",
      accessToken,
    });
  },

  async rejectTeacherRequest(teacherProfileId: number, rejectReason: string) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/teacher-requests/${teacherProfileId}/reject`, {
      method: "PUT",
      accessToken,
      body: { rejectReason },
    });
  },

  async listUsers(filters?: { role?: string; status?: string; keyword?: string }) {
    const accessToken = getAccessToken();
    const params = new URLSearchParams();

    if (filters?.role) {
      params.set("role", filters.role);
    }
    if (filters?.status) {
      params.set("status", filters.status);
    }
    if (filters?.keyword) {
      params.set("keyword", filters.keyword);
    }

    const query = params.toString();
    const path = query ? `/api/v1/admin/users?${query}` : "/api/v1/admin/users";

    return requestJson<AdminUserData[]>(path, {
      method: "GET",
      accessToken,
    });
  },

  async banUser(userId: number) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/users/${userId}/ban`, {
      method: "PUT",
      accessToken,
    });
  },

  async unbanUser(userId: number) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/users/${userId}/unban`, {
      method: "PUT",
      accessToken,
    });
  },

  async changeUserRole(userId: number, roleName: string) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/users/${userId}/role`, {
      method: "PUT",
      accessToken,
      body: { roleName },
    });
  },

  async getUserPermissions(userId: number) {
    const accessToken = getAccessToken();
    return requestJson<AdminUserPermissionsData>(`/api/v1/admin/users/${userId}/permissions`, {
      method: "GET",
      accessToken,
    });
  },

  async assignUserPermissions(userId: number, permissionIds: number[]) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/users/${userId}/permissions`, {
      method: "PUT",
      accessToken,
      body: { permissionIds },
    });
  },

  async listRoles() {
    const accessToken = getAccessToken();
    return requestJson<AdminRoleData[]>("/api/v1/admin/roles", {
      method: "GET",
      accessToken,
    });
  },

  async createRole(name: string, description?: string) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>("/api/v1/admin/roles", {
      method: "POST",
      accessToken,
      body: { name, description },
    });
  },

  async updateRole(roleId: number, payload: UpdateRolePayload) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/roles/${roleId}`, {
      method: "PUT",
      accessToken,
      body: payload,
    });
  },

  async listPermissions() {
    const accessToken = getAccessToken();
    return requestJson<AdminPermissionData[]>("/api/v1/admin/permissions", {
      method: "GET",
      accessToken,
    });
  },

  async assignRolePermissions(roleId: number, permissionIds: number[]) {
    const accessToken = getAccessToken();
    return requestJson<MessageData>(`/api/v1/admin/roles/${roleId}/permissions`, {
      method: "PUT",
      accessToken,
      body: { permissionIds },
    });
  },
};

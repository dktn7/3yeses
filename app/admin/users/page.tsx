"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Download,
  MoreVertical,
  ChevronDown,
  Ban,
  Mail,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import AdminModal from "@/components/admin/AdminModal";
import SmartSearch from "@/components/admin/SmartSearch";
import { formatAdminDate } from "@/lib/admin/formatters";
import { useDebounce } from "@/hooks/useDebounce";

/* â”€â”€â”€â”€â”€ Action Dropdown Component â”€â”€â”€â”€â”€ */
function ActionDropdown({ user, onView, onEdit, onWarn, onBan, onDelete }: {
  user: { id: string; name: string };
  onView: () => void;
  onEdit: () => void;
  onWarn: () => void;
  onBan: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = [
    { label: "View Profile", icon: Eye, onClick: onView, color: "text-[var(--admin-primary)]" },
    { label: "Edit User", icon: Edit, onClick: onEdit, color: "text-[var(--admin-text)]" },
    { label: "Send Warning", icon: AlertTriangle, onClick: onWarn, color: "text-amber-500" },
    { label: "Ban User", icon: Ban, onClick: onBan, color: "text-red-500" },
    { label: "Delete User", icon: Trash2, onClick: onDelete, color: "text-rose-500" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
        title={`Actions for ${user.name}`}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => { setOpen(false); item.onClick(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--admin-bg)] transition-colors ${item.color}`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: string | null;
  profilePicture: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  talentProfile?: {
    isAvailable: boolean;
    category?: Category;
  };
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Separate CSV export function
const exportToCSV = (users: User[]) => {
  const headers = ["ID", "Name", "Email", "Role", "Status", "Joined", "Last Login"];
  const rows = users.map(user => [
    user.id,
    user.name,
    user.email,
    user.role,
    user.emailVerified ? "Verified" : "Unverified",
    formatAdminDate(user.createdAt, { year: 'numeric', month: 'short', day: 'numeric' }),
    user.lastLoginAt ? formatAdminDate(user.lastLoginAt, { year: 'numeric', month: 'short', day: 'numeric' }) : "Never"
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // 500ms debounce
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'warn' | 'ban'>('warn');
  const [actionReason, setActionReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [addUserForm, setAddUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "TALENT",
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      return res.json() as Promise<{ categories: Category[] }>;
    }
  });

  // Fetch Users
  const { data: usersData, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "users", page, roleFilter, statusFilter, categoryFilter, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        role: roleFilter,
        status: statusFilter,
        categoryId: categoryFilter,
        search: debouncedSearch,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      return res.json() as Promise<UsersResponse>;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });

  const users = usersData?.users || [];
  const totalPages = usersData?.pagination.totalPages || 1;
  const totalCount = usersData?.pagination.totalCount || 0;

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; email: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsEditModalOpen(false);
      toast.success("User updated successfully");
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsDeleteModalOpen(false);
      toast.success("User deleted successfully");
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      // In a real app, you'd have a bulk delete endpoint. 
      // For now, we'll simulate by deleting one by one or create a bulk endpoint later.
      // Assuming a bulk endpoint or looping:
       const promises = userIds.map(id => fetch(`/api/admin/users/${id}`, { method: "DELETE" }));
       await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSelectedUserIds(new Set());
      toast.success("Selected users deleted successfully");
    },
    onError: () => toast.error("Failed to delete users"),
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; role: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create user');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsAddUserModalOpen(false);
      setAddUserForm({ name: "", email: "", password: "", role: "TALENT" });
      toast.success("User created successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create user"),
  });

  const userActionMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: string; reason: string }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) throw new Error('Action failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsActionModalOpen(false);
      setActionReason('');
      setSelectedUser(null);
      toast.success('Action completed successfully');
    },
    onError: () => toast.error("Action failed"),
  });


  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const handleBulkDelete = () => {
    setShowBulkConfirm(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedUserIds));
    setShowBulkConfirm(false);
  };

  const handleExport = () => {
    // Export currently filtered users. 
    // Ideally, fetching all matching users from API for export is better, 
    // but here we export current view or all available in cache if needed.
    // For simplicity, let's export the current page's users.
    if (users.length > 0) {
      exportToCSV(users);
      toast.success("Export started");
    } else {
      toast.error("No users to export");
    }
  };


  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
      case "TALENT": return "bg-blue-100 text-blue-700 dark:bg-red-500/20 dark:text-red-300";
      default: return "bg-[var(--admin-bg)] text-[var(--admin-muted)] ";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">User Management</h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">Manage and monitor platform users ({totalCount} total)</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
           >
             <Download className="h-4 w-4" />
             <span>Export CSV</span>
           </button>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-bold shadow-lg shadow-[var(--admin-primary)]/20 hover:opacity-90 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-glass rounded-xl p-6 border border-[var(--admin-border)] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="col-span-1 md:col-span-4">
             <SmartSearch onSearch={(term) => { setSearch(term); setPage(1); }} initialValue={search} />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoriesData?.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="TALENT">Talent</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUserIds.size > 0 && (
          <div className="flex items-center gap-4 p-3 bg-[var(--admin-primary)]/5 border border-[var(--admin-primary)]/20 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[var(--admin-primary)]" />
              <span className="text-sm font-bold text-[var(--admin-primary)]">{selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''} selected</span>
            </div>
            <div className="h-5 w-px bg-[var(--admin-border)]" />
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </button>
            <button 
              onClick={() => setSelectedUserIds(new Set())}
              className="px-3 py-1.5 text-xs font-bold text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="admin-glass rounded-xl border border-[var(--admin-border)] overflow-hidden relative">
        {isFetching && (
           <div className="absolute inset-0 bg-[var(--admin-surface)]/50 z-10 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-[var(--admin-primary)] border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--admin-surface)]/50 border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-6 py-4 w-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-[var(--admin-border)] text-indigo-600 focus:ring-indigo-500"
                    checked={users.length > 0 && selectedUserIds.size === users.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]/50">
              {isLoading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-4 bg-[var(--admin-border)] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-10 w-48 bg-[var(--admin-border)] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-[var(--admin-border)] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-[var(--admin-border)] rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-[var(--admin-border)] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-[var(--admin-border)] rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-[var(--admin-border)] rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--admin-muted)]">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`hover:bg-[var(--admin-primary)]/5 transition-colors group ${selectedUserIds.has(user.id) ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-6 py-4">
                       <input 
                        type="checkbox" 
                        className="rounded border-[var(--admin-border)] text-indigo-600 focus:ring-indigo-500"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.profilePicture ? (
                            <Image className="rounded-full object-cover" src={user.profilePicture} alt={user.name} width={40} height={40} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[var(--admin-bg)] flex items-center justify-center border border-[var(--admin-border)]">
                              <span className="text-[var(--admin-primary)] font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[var(--admin-text)]">{user.name}</div>
                          <div className="text-xs text-[var(--admin-muted)]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.talentProfile?.category ? (
                        <span className="text-sm text-[var(--admin-text)]">{user.talentProfile.category.name}</span>
                      ) : <span className="text-sm text-[var(--admin-muted)]">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'ADMIN' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center text-green-700 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-yellow-700 dark:text-yellow-400">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Unverified</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--admin-muted)]">
                      {formatAdminDate(user.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionDropdown
                        user={user}
                        onView={() => window.location.href = `/admin/users/${user.id}`}
                        onEdit={() => openEditModal(user)}
                        onWarn={() => { setSelectedUser(user); setActionType('warn'); setIsActionModalOpen(true); }}
                        onBan={() => { setSelectedUser(user); setActionType('ban'); setIsActionModalOpen(true); }}
                        onDelete={() => openDeleteModal(user)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-[var(--admin-bg)] px-6 py-4 border-t border-[var(--admin-border)] flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-[var(--admin-border)] rounded-lg text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--admin-text)]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-[var(--admin-border)] rounded-lg text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        description={`Modifying profile for ${selectedUser?.name}`}
        type="info"
        footer={
          <>
            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={() => selectedUser && updateUserMutation.mutate({ id: selectedUser.id, ...editForm })}
              disabled={updateUserMutation.isPending}
              className="px-4 py-2 bg-[var(--admin-primary)] hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              {updateUserMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Email Address</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">System Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer"
            >
              <option value="USER">User</option>
              <option value="TALENT">Talent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </AdminModal>

      {/* Delete User Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        description="This action cannot be undone."
        type="danger"
        footer={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
              disabled={deleteUserMutation.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              {deleteUserMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Delete Permanently
            </button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <div>
            <p className="text-sm text-[var(--admin-muted)]">
              You are about to delete <span className="font-bold text-[var(--admin-text)]">{selectedUser?.name}</span>. 
              All associated data will be permanently removed.
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Bulk Delete Confirmation Modal */}
      <AdminModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        title="Delete Multiple Users"
        description={`You are about to delete ${selectedUserIds.size} users.`}
        type="danger"
        footer={
          <>
            <button onClick={() => setShowBulkConfirm(false)} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={confirmBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              {bulkDeleteMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Delete {selectedUserIds.size} Users
            </button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <div>
            <p className="text-sm text-[var(--admin-muted)]">
              This will permanently remove <span className="font-bold text-[var(--admin-text)]">{selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''}</span> and all their associated data. This cannot be undone.
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Add User Modal */}
      <AdminModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add New User"
        description="Create a new platform user account"
        type="info"
        footer={
          <>
            <button onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={() => addUserMutation.mutate(addUserForm)}
              disabled={addUserMutation.isPending || !addUserForm.name || !addUserForm.email || !addUserForm.password}
              className="px-4 py-2 bg-[var(--admin-primary)] hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              {addUserMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Create User
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Full Name</label>
            <input
              type="text"
              value={addUserForm.name}
              onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Email Address</label>
            <input
              type="email"
              value={addUserForm.email}
              onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
              placeholder="Enter email address"
              className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Password</label>
            <input
              type="password"
              value={addUserForm.password}
              onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
              placeholder="Set initial password"
              className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Role</label>
            <select
              value={addUserForm.role}
              onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer"
            >
              <option value="USER">User</option>
              <option value="TALENT">Talent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </AdminModal>

      {/* Warn / Ban Action Modal */}
      <AdminModal
        isOpen={isActionModalOpen}
        onClose={() => { setIsActionModalOpen(false); setActionReason(''); }}
        title={actionType === 'warn' ? 'Send Warning' : 'Ban User'}
        description={`${actionType === 'warn' ? 'Issue a warning to' : 'Ban'} ${selectedUser?.name}`}
        type={actionType === 'warn' ? 'warning' : 'danger'}
        footer={
          <>
            <button onClick={() => { setIsActionModalOpen(false); setActionReason(''); }} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={() => selectedUser && userActionMutation.mutate({ userId: selectedUser.id, action: actionType, reason: actionReason })}
              disabled={userActionMutation.isPending || !actionReason.trim()}
              className={`px-4 py-2 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 ${
                actionType === 'warn' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {userActionMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {actionType === 'warn' ? 'Send Warning' : 'Ban User'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            actionType === 'warn' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'
          }`}>
            {actionType === 'warn' ? (
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            ) : (
              <Ban className="text-red-500 shrink-0 mt-0.5" size={20} />
            )}
            <p className="text-sm text-[var(--admin-muted)]">
              {actionType === 'warn'
                ? 'This will send a warning notification to the user. The warning will be logged in their account history.'
                : 'This will immediately restrict the user from accessing the platform. They will see a banned message on login.'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Reason (required)</label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={actionType === 'warn' ? 'Describe the reason for this warning...' : 'Describe the reason for this ban...'}
              rows={3}
              className="w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)] resize-none"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

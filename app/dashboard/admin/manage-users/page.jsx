"use client";

import { useEffect, useState } from "react";
import { Eye, Loader2, Search, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const getUsers = (payload) => payload?.users || payload?.data || [];
const getId = (user) => user._id || user.id;
const pageSize = 10;

export default function ManageUsersPage() {
  const [users, setUsers] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState("");

  async function loadUsers() {
    setError("");
    try {
      const params = new URLSearchParams({ page: String(pagination.page), limit: String(pageSize) });
      if (search) params.set("search", search);
      if (role !== "all") params.set("role", role);
      const payload = await apiFetch(`/admin/users?${params}`);
      setUsers(getUsers(payload));
      setPagination((current) => ({ ...current, ...(payload?.pagination || {}), totalPages: payload?.pagination?.totalPages || payload?.totalPages || 1, total: payload?.pagination?.total || payload?.total || 0 }));
    } catch (requestError) { setError(requestError.message || "Unable to load users."); }
  }
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(pagination.page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (role !== "all") params.set("role", role);
    apiFetch(`/admin/users?${params}`).then((payload) => {
      if (!active) return;
      setUsers(getUsers(payload));
      setPagination((current) => ({ ...current, ...(payload?.pagination || {}), totalPages: payload?.pagination?.totalPages || payload?.totalPages || 1, total: payload?.pagination?.total || payload?.total || 0 }));
    }).catch((requestError) => { if (active) setError(requestError.message || "Unable to load users."); });
    return () => { active = false; };
  }, [pagination.page, role, search]);

  function submitSearch(event) { event.preventDefault(); setPagination((current) => ({ ...current, page: 1 })); setSearch(searchInput.trim()); }
  async function toggleBlocked() {
    const id = getId(target);
    setBusy(id);
    try {
      const nextBlocked = !target.isBlocked;
      const result = await apiFetch(`/admin/users/${id}/${nextBlocked ? "block" : "unblock"}`, { method: "PATCH" });
      const updated = result?.user || result?.data || { ...target, isBlocked: nextBlocked };
      setUsers((current) => current.map((user) => getId(user) === id ? { ...user, ...updated, isBlocked: updated.isBlocked ?? nextBlocked } : user));
      setTarget(null);
      toast.success(nextBlocked ? "User blocked." : "User unblocked.");
    } catch (requestError) { toast.error(requestError.message || "Unable to update user access."); } finally { setBusy(""); }
  }

  return <div><PageHeader eyebrow="Admin workspace" title="Manage users" description="Review accounts, roles, and access across the WedPlan community." /><Card className="mb-6"><CardContent className="p-4"><form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by name or email" className="pl-9" /></div><Select value={role} onValueChange={(value) => { setRole(value || "all"); setPagination((current) => ({ ...current, page: 1 })); }}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All roles" /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="vendor">Vendor</SelectItem><SelectItem value="customer">Customer</SelectItem></SelectContent></Select><Button type="submit">Search</Button></form></CardContent></Card>{error ? <EmptyState title="Users unavailable" description={error} action={{ label: "Try again", onClick: loadUsers }} /> : !users ? <Card><CardContent className="space-y-4 p-6">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</CardContent></Card> : users.length === 0 ? <EmptyState title="No users found" description="Try a different search or role filter." /> : <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Access</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{users.map((user) => <TableRow key={getId(user)}><TableCell><p className="font-medium">{user.name || user.fullName || "Unnamed user"}</p><p className="text-xs text-muted-foreground">{user.email}</p></TableCell><TableCell><Badge variant="secondary">{user.role}</Badge></TableCell><TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</TableCell><TableCell><Badge variant={user.isBlocked ? "destructive" : "default"}>{user.isBlocked ? "Blocked" : "Active"}</Badge></TableCell><TableCell><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => setDetails(user)} aria-label="View user details"><Eye /></Button><Button variant="outline" size="sm" onClick={() => setTarget(user)}>{user.isBlocked ? <><ShieldCheck /> Unblock</> : <><ShieldOff /> Block</>}</Button></div></TableCell></TableRow>)}</TableBody></Table></div><PaginationControls page={pagination.page} totalPages={pagination.totalPages} onChange={(page) => setPagination((current) => ({ ...current, page }))} /></CardContent></Card>}<Dialog open={Boolean(details)} onOpenChange={(open) => !open && setDetails(null)}><DialogContent><DialogHeader><DialogTitle>User details</DialogTitle><DialogDescription>Account information for {details?.name || details?.email}.</DialogDescription></DialogHeader>{details && <dl className="grid gap-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Name</dt><dd>{details.name || details.fullName || "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Email</dt><dd>{details.email}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Role</dt><dd className="capitalize">{details.role}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Phone</dt><dd>{details.phone || "—"}</dd></div></dl>}<DialogFooter><DialogClose render={<Button variant="outline" />}>Close</DialogClose></DialogFooter></DialogContent></Dialog><Dialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}><DialogContent><DialogHeader><DialogTitle>{target?.isBlocked ? "Unblock this user?" : "Block this user?"}</DialogTitle><DialogDescription>{target?.isBlocked ? "They will be able to access their account again." : "They will be signed out and unable to access protected features."}</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><Button variant={target?.isBlocked ? "default" : "destructive"} onClick={toggleBlocked} disabled={Boolean(busy)}>{busy ? <Loader2 className="animate-spin" /> : target?.isBlocked ? "Unblock user" : "Block user"}</Button></DialogFooter></DialogContent></Dialog></div>;
}

function PaginationControls({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-between border-t p-4 text-sm"><span className="text-muted-foreground">Page {page} of {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button></div></div>;
}

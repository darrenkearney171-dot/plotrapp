import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  ClipboardList,
  Download,
  FileText,
  HardHat,
  Loader2,
  Mail,
  Plus,
  Search,
  ShoppingCart,
  Target,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function AddSupplierDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "general", region: "", websiteUrl: "", affiliateUrl: "", commissionRate: "0.03", phone: "", email: "", description: "", isNational: false });
  const createSupplier = trpc.admin.createSupplier.useMutation({
    onSuccess: () => { toast.success("Supplier added!"); setOpen(false); onAdded(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Supplier</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="col-span-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["timber_merchants","builders_merchants","paint_decorating","roofing_insulation","flooring","kitchen_bathroom","electrical_plumbing","windows_doors","general"].map(c => (
                  <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Region</Label>
            <Input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="mt-1" placeholder="e.g. the island of Ireland" />
          </div>
          <div>
            <Label>Commission Rate</Label>
            <Input type="number" step="0.01" min="0" max="1" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" />
          </div>
          <div className="col-span-2">
            <Label>Website URL</Label>
            <Input value={form.websiteUrl} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} className="mt-1" placeholder="https://" />
          </div>
          <div className="col-span-2">
            <Label>Affiliate URL</Label>
            <Input value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} className="mt-1" placeholder="https://" />
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="isNational" checked={form.isNational} onChange={e => setForm(f => ({ ...f, isNational: e.target.checked }))} />
            <Label htmlFor="isNational">National supplier</Label>
          </div>
          <div className="col-span-2">
            <Button
              className="w-full"
              disabled={!form.name || createSupplier.isPending}
              onClick={() => createSupplier.mutate({
                name: form.name,
                category: form.category as any,
                region: form.region || undefined,
                isNational: form.isNational,
                websiteUrl: form.websiteUrl || undefined,
                affiliateUrl: form.affiliateUrl || undefined,
                commissionRate: parseFloat(form.commissionRate),
                phone: form.phone || undefined,
                email: form.email || undefined,
                description: form.description || undefined,
              })}
            >
              {createSupplier.isPending ? "Adding..." : "Add Supplier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddTradespersonDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trade: "builder_general", region: "", phone: "", email: "", bio: "", yearsExperience: "", qualifications: "" });
  const createTradesperson = trpc.admin.createTradesperson.useMutation({
    onSuccess: () => { toast.success("Tradesperson added!"); setOpen(false); onAdded(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Tradesperson</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Tradesperson</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="col-span-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Trade *</Label>
            <Select value={form.trade} onValueChange={v => setForm(f => ({ ...f, trade: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["joiner_carpenter","plumber","electrician","plasterer","painter_decorator","roofer","tiler","builder_general","kitchen_fitter","bathroom_fitter","landscaper","other"].map(t => (
                  <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Region *</Label>
            <Input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="mt-1" placeholder="e.g. Belfast" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Years Experience</Label>
            <Input type="number" value={form.yearsExperience} onChange={e => setForm(f => ({ ...f, yearsExperience: e.target.value }))} className="mt-1" />
          </div>
          <div className="col-span-2">
            <Label>Bio</Label>
            <Input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="mt-1" />
          </div>
          <div className="col-span-2">
            <Label>Qualifications</Label>
            <Input value={form.qualifications} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} className="mt-1" />
          </div>
          <div className="col-span-2">
            <Button
              className="w-full"
              disabled={!form.name || !form.region || createTradesperson.isPending}
              onClick={() => createTradesperson.mutate({
                name: form.name,
                trade: form.trade as any,
                region: form.region,
                phone: form.phone || undefined,
                email: form.email || undefined,
                bio: form.bio || undefined,
                yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
                qualifications: form.qualifications || undefined,
              })}
            >
              {createTradesperson.isPending ? "Adding..." : "Add Tradesperson"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const isAdmin = isAuthenticated && user?.role === "admin";
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });
  const { data: funnel } = trpc.admin.funnelStats.useQuery(undefined, { enabled: isAdmin });
  const { data: suppliers } = trpc.admin.listSuppliers.useQuery(undefined, { enabled: isAdmin });
  const { data: tradespeople } = trpc.admin.listTradespeople.useQuery(undefined, { enabled: isAdmin });
  const { data: users } = trpc.admin.listUsers.useQuery({}, { enabled: isAdmin });
  const { data: recentActivity } = trpc.admin.recentActivity.useQuery(undefined, { enabled: isAdmin });

  const deleteSupplier = trpc.admin.deleteSupplier.useMutation({
    onSuccess: () => { toast.success("Supplier removed"); utils.admin.listSuppliers.invalidate(); },
  });
  const updateSupplier = trpc.admin.updateSupplier.useMutation({
    onSuccess: () => { toast.success("Supplier updated!"); utils.admin.listSuppliers.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const verifyTradesperson = trpc.admin.verifyTradesperson.useMutation({
    onSuccess: () => { toast.success("Updated!"); utils.admin.listTradespeople.invalidate(); },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><a href={getLoginUrl()}><Button>Sign In</Button></a></div>;
  if (user?.role !== "admin") return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <XCircle className="w-12 h-12 text-destructive" />
      <h2 className="text-xl font-bold">Access Denied</h2>
      <p className="text-muted-foreground">Admin access required.</p>
      <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Dashboard</Button></Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Renolab Admin</span>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">Admin Panel</Badge>
        </div>
      </header>

      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>

        {/* Funnel Metrics */}
        {funnel && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Funnel (all time)</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <FunnelStep icon={Mail} label="Waitlist" value={funnel.waitlist} sub={funnel.last7Days.waitlist > 0 ? `+${funnel.last7Days.waitlist} this week` : undefined} />
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <FunnelStep icon={FileText} label="Estimates" value={funnel.leads} sub={funnel.last7Days.leads > 0 ? `+${funnel.last7Days.leads} this week` : undefined} />
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <FunnelStep icon={ClipboardList} label="Fitted Est." value={funnel.fittedEstimates} />
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <FunnelStep icon={Target} label="Quote Req." value={funnel.quoteRequests} sub={funnel.last7Days.quotes > 0 ? `+${funnel.last7Days.quotes} this week` : undefined} />
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <FunnelStep icon={Users} label="Signups" value={funnel.registeredUsers} sub={funnel.last7Days.users > 0 ? `+${funnel.last7Days.users} this week` : undefined} />
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <FunnelStep icon={TrendingUp} label="Converted" value={funnel.convertedLeads} sub={funnel.leads > 0 ? `${((funnel.convertedLeads / funnel.leads) * 100).toFixed(1)}% rate` : undefined} />
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              <Badge variant="outline" className="text-xs">Trade apps: {funnel.tradeApplications}</Badge>
              {funnel.leadsByType?.map((lt: any) => (
                <Badge key={lt.estimateType} variant="outline" className="text-xs">{lt.estimateType}: {Number(lt.count)} leads</Badge>
              ))}
              {funnel.quotesByStatus?.map((qs: any) => (
                <Badge key={qs.status} variant="outline" className="text-xs">Quotes {qs.status}: {Number(qs.count)}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Basic Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats.users} />
            <StatCard icon={Building2} label="Projects" value={stats.projects} />
            <StatCard icon={ShoppingCart} label="Active Suppliers" value={stats.suppliers} />
            <StatCard icon={HardHat} label="Tradespeople" value={stats.tradespeople} />
            <StatCard icon={BarChart3} label="Room Analyses" value={stats.analyses} />
            <StatCard icon={BarChart3} label="Affiliate Clicks" value={stats.affiliateClicks} />
            {stats.tierCounts?.map((t: any) => (
              <StatCard key={t.tier} icon={Users} label={`${t.tier} users`} value={Number(t.count)} />
            ))}
          </div>
        )}

        {/* Recent Activity Feed */}
        {recentActivity && recentActivity.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Activity</h2>
            <div className="bg-card border border-border rounded-xl p-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {recentActivity.slice(0, 15).map((item: any, i: number) => (
                  <div key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-3 text-sm py-1.5 border-b border-border/50 last:border-0">
                    <ActivityIcon type={item.type} />
                    <span className="font-medium text-xs capitalize">{activityLabel(item.type)}</span>
                    <span className="text-muted-foreground text-xs truncate flex-1">{item.email ?? "—"}</span>
                    {item.detail && <Badge variant="outline" className="text-xs shrink-0">{item.detail}</Badge>}
                    <span className="text-muted-foreground text-xs shrink-0">{timeAgo(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="leads">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="fitted">Fitted Estimates</TabsTrigger>
            <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
            <TabsTrigger value="email-list">Email List</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="tradespeople">Tradespeople</TabsTrigger>
            <TabsTrigger value="trade-apps">Trade Applications</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          </TabsList>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Suppliers ({suppliers?.length ?? 0})</h2>
              <AddSupplierDialog onAdded={() => utils.admin.listSuppliers.invalidate()} />
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Region</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Commission</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers?.map(s => (
                    <tr key={s.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize text-xs">{s.category?.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{s.region ?? (s.isNational ? "National" : "—")}</td>
                      <td className="px-4 py-3 text-right text-xs">{s.commissionRate ? `${(s.commissionRate * 100).toFixed(0)}%` : "—"}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            const newRate = prompt("New commission rate (0-1):", String(s.commissionRate ?? 0.03));
                            if (newRate !== null) updateSupplier.mutate({ id: s.id, commissionRate: parseFloat(newRate) });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("Remove supplier?")) deleteSupplier.mutate({ id: s.id }); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!suppliers?.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No suppliers yet. Add one above.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Tradespeople Tab */}
          <TabsContent value="tradespeople">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Tradespeople ({tradespeople?.length ?? 0})</h2>
              <AddTradespersonDialog onAdded={() => utils.admin.listTradespeople.invalidate()} />
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Trade</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Region</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Verified</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tradespeople?.map(t => (
                    <tr key={t.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize text-xs">{t.trade?.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{t.region}</td>
                      <td className="px-4 py-3 text-center">
                        {t.isVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => verifyTradesperson.mutate({ id: t.id, isVerified: !t.isVerified })}
                        >
                          {t.isVerified ? "Unverify" : "Verify"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!tradespeople?.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No tradespeople yet. Add one above.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <h2 className="font-semibold mb-4">Users ({users?.length ?? 0})</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map(u => (
                    <tr key={u.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{u.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{u.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${u.subscriptionTier === "free" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary border-primary/20"}`}>
                          {u.subscriptionTier}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!users?.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          {/* Leads Tab */}
          <TabsContent value="leads">
            <LeadsTab />
          </TabsContent>
          {/* Fitted Estimates Tab */}
          <TabsContent value="fitted">
            <FittedEstimatesTab />
          </TabsContent>
          {/* Quote Requests Tab */}
          <TabsContent value="quotes">
            <QuoteRequestsTab />
          </TabsContent>
          {/* Trade Applications Tab */}
          <TabsContent value="trade-apps">
            <TradeApplicationsTab />
          </TabsContent>
          {/* Email List Tab */}
          <TabsContent value="email-list">
            <EmailListTab />
          </TabsContent>
          {/* Waitlist Tab */}
          <TabsContent value="waitlist">
            <WaitlistAdminTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function TradeApplicationsTab() {
  const { isAuthenticated } = useAuth();
  const { data: applications, isLoading } = trpc.trade.list.useQuery(undefined, { enabled: isAuthenticated });

  function exportCSV() {
    if (!applications || applications.length === 0) return;
    const header = "Name,Trade,Town,Phone,Email,Submitted";
    const rows = applications.map((a: any) => `${a.fullName},${a.trade},${a.town},${a.phone},${a.email},${new Date(a.createdAt).toLocaleDateString()}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `renolab-trade-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Trade Applications</h2>
          <p className="text-sm text-muted-foreground">{applications?.length ?? 0} applications received</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV} disabled={!applications || applications.length === 0}>
          Export CSV
        </Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Trade</th>
              <th className="text-left px-4 py-3 font-medium">Town</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
            ) : applications && applications.length > 0 ? (
              applications.map((app: any) => (
                <tr key={app.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{app.fullName}</td>
                  <td className="px-4 py-3">{app.trade}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.town}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No trade applications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailListTab() {
  const { data: entries, isLoading } = trpc.admin.emailList.useQuery();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filtered = (entries ?? []).filter((e: any) => {
    const matchSearch = !search || e.email.toLowerCase().includes(search.toLowerCase()) || (e.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === "all" || e.source.toLowerCase().includes(sourceFilter.toLowerCase());
    return matchSearch && matchSource;
  });

  function exportCSV() {
    if (!filtered || filtered.length === 0) return;
    const header = "Email,Name,Source,Trade,Joined";
    const rows = filtered.map((e: any) => {
      const joined = e.joinedAt ? new Date(e.joinedAt).toLocaleDateString("en-GB") : "";
      return `"${e.email}","${e.name ?? ""}","${e.source}","${e.trade ?? ""}","${joined}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `renolab-email-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const sourceOptions = ["all", "Waitlist", "Registered", "Trade Applicant"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> Email List</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${filtered.length} contacts${entries && filtered.length !== entries.length ? ` (${entries.length} total)` : ""}`}
          </p>
        </div>
        <Button size="sm" onClick={exportCSV} disabled={filtered.length === 0} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map(s => (
              <SelectItem key={s} value={s}>{s === "all" ? "All sources" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Source</th>
              <th className="text-left px-4 py-3 font-medium">Trade</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((entry: any, i: number) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{entry.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.name ?? <span className="italic text-muted-foreground/50">—</span>}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">{entry.source}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.trade ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.joinedAt ? new Date(entry.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No contacts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        This list combines all waitlist sign-ups, registered users, and trade applicants. Duplicate emails are merged. Export as CSV to import into Mailchimp, ConvertKit, or any email platform.
      </p>
    </div>
  );
}

// âââ Helper Components ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function FunnelStep({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 min-w-[120px] text-center shrink-0">
      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-green-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 shrink-0";
  switch (type) {
    case "lead": return <FileText className={`${cls} text-blue-500`} />;
    case "waitlist": return <Mail className={`${cls} text-purple-500`} />;
    case "signup": return <Users className={`${cls} text-green-500`} />;
    case "trade_app": return <HardHat className={`${cls} text-amber-500`} />;
    case "quote": return <Target className={`${cls} text-red-500`} />;
    case "fitted": return <ClipboardList className={`${cls} text-indigo-500`} />;
    default: return <Activity className={`${cls} text-muted-foreground`} />;
  }
}

function activityLabel(type: string): string {
  switch (type) {
    case "lead": return "New estimate";
    case "waitlist": return "Waitlist signup";
    case "signup": return "New user";
    case "trade_app": return "Trade application";
    case "quote": return "Quote request";
    case "fitted": return "Fitted estimate";
    default: return type;
  }
}

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// âââ Leads Tab ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function LeadsTab() {
  const { data: leads, isLoading } = trpc.admin.listLeads.useQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = (leads ?? []).filter((l: any) => {
    const matchSearch = !search || l.email.toLowerCase().includes(search.toLowerCase()) || (l.firstName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || l.estimateType === typeFilter;
    return matchSearch && matchType;
  });

  function exportCSV() {
    if (!filtered.length) return;
    const header = "Email,Name,User Type,Project Type,Estimate Type,Cost Low,Cost High,Converted,Date";
    const rows = filtered.map((l: any) =>
      `"${l.email}","${l.firstName ?? ""}","${l.userType}","${l.projectType ?? ""}","${l.estimateType}","${l.costRangeLow ?? ""}","${l.costRangeHigh ?? ""}","${l.convertedToUser ? "Yes" : "No"}","${new Date(l.createdAt).toLocaleDateString("en-GB")}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `renolab-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Guest Estimate Leads</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} leads{leads && filtered.length !== leads.length ? ` of ${leads.length}` : ""}</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV} disabled={!filtered.length} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email or name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="renovation">Renovation</SelectItem>
            <SelectItem value="new_build">New Build</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Project</th>
              <th className="text-right px-4 py-3 font-medium">Cost Range</th>
              <th className="text-center px-4 py-3 font-medium">Converted</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((l: any) => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{l.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.firstName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs ${l.estimateType === "new_build" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
                      {l.estimateType === "new_build" ? "New Build" : "Renovation"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.projectType ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-xs">
                    {l.costRangeLow != null ? `£${l.costRangeLow.toLocaleString()} – £${l.costRangeHigh?.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {l.convertedToUser ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// âââ Fitted Estimates Tab âââââââââââââââââââââââââââââââââââââââââââââââââââ

function FittedEstimatesTab() {
  const { data: estimates, isLoading } = trpc.admin.listFittedEstimates.useQuery();

  function exportCSV() {
    if (!estimates?.length) return;
    const header = "Email,User Type,Category,Supply Mode,Range Low,Range High,Total Low,Total High,Date";
    const rows = estimates.map((e: any) =>
      `"${e.guestEmail ?? "registered"}","${e.userType}","${e.category}","${e.supplyMode}","${e.estimateRangeLow}","${e.estimateRangeHigh}","${e.grandTotalLow}","${e.grandTotalHigh}","${new Date(e.createdAt).toLocaleDateString("en-GB")}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `renolab-fitted-estimates-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Fitted Furniture Estimates</h2>
          <p className="text-sm text-muted-foreground">{estimates?.length ?? 0} estimates</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV} disabled={!estimates?.length} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">User Type</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Supply</th>
              <th className="text-right px-4 py-3 font-medium">Estimate Range</th>
              <th className="text-right px-4 py-3 font-medium">Grand Total</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
            ) : estimates && estimates.length > 0 ? (
              estimates.map((e: any) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{e.guestEmail ?? <Badge variant="outline" className="text-xs">Registered</Badge>}</td>
                  <td className="px-4 py-3 text-xs capitalize">{e.userType}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs capitalize">{e.category.replace(/_/g, " ")}</Badge></td>
                  <td className="px-4 py-3 text-xs capitalize">{e.supplyMode.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-right text-xs">£{e.estimateRangeLow?.toLocaleString()} – £{e.estimateRangeHigh?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-xs font-medium">£{e.grandTotalLow?.toLocaleString()} – £{e.grandTotalHigh?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No fitted estimates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// âââ Quote Requests Tab âââââââââââââââââââââââââââââââââââââââââââââââââââââ

function QuoteRequestsTab() {
  const utils = trpc.useUtils();
  const { data: quotes, isLoading } = trpc.admin.listQuoteRequests.useQuery();
  const updateStatus = trpc.admin.updateQuoteStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.admin.listQuoteRequests.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    quoted: "bg-purple-100 text-purple-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Formal Quote Requests</h2>
          <p className="text-sm text-muted-foreground">{quotes?.length ?? 0} requests</p>
        </div>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Estimate</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
            ) : quotes && quotes.length > 0 ? (
              quotes.map((q: any) => (
                <tr key={q.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{q.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{q.email}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{q.phone ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs capitalize">{q.category.replace(/_/g, " ")}</Badge></td>
                  <td className="px-4 py-3 text-right text-xs">
                    {q.estimateRangeLow != null ? `£${q.estimateRangeLow.toLocaleString()} – £${q.estimateRangeHigh?.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Select value={q.status} onValueChange={(v) => updateStatus.mutate({ id: q.id, status: v as any })}>
                      <SelectTrigger className="h-7 text-xs w-28 mx-auto">
                        <Badge className={`text-xs ${statusColors[q.status] ?? ""}`}>{q.status}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {["new", "contacted", "quoted", "won", "lost"].map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No quote requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {quotes && quotes.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3">Use the status dropdown to track each quote through your pipeline: new → contacted → quoted → won/lost.</p>
      )}
    </div>
  );
}

function WaitlistAdminTab() {
  const { data: entries, isLoading } = trpc.waitlist.list.useQuery();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const SOURCE_OPTIONS = [
    { value: "all", label: "All sources" },
    { value: "homepage", label: "Homepage" },
    { value: "navbar", label: "Nav bar" },
    { value: "pricing", label: "Pricing page" },
    { value: "suppliers", label: "Suppliers page" },
    { value: "banner", label: "Sitewide banner" },
    { value: "kitchen_estimator", label: "Kitchen Estimator" },
  ];

  const filtered = (entries ?? []).filter((e: any) => {
    const matchSearch = !search || e.email.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === "all" || (e.source ?? "").toLowerCase().includes(sourceFilter.toLowerCase());
    return matchSearch && matchSource;
  });

  function exportCSV() {
    if (!filtered || filtered.length === 0) return;
    const header = "Email,Source,Button,Tier Interest,Joined";
    const rows = filtered.map((e: any) => {
      const joined = new Date(e.createdAt).toLocaleDateString("en-GB");
      return `"${e.email}","${e.source || ""}","${e.buttonLabel || ""}","${e.tier || ""}","${joined}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `renolab-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Waitlist Signups</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} entries{entries && filtered.length !== entries.length ? ` of ${entries.length}` : ""}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV} disabled={filtered.length === 0} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Source</th>
              <th className="text-left px-4 py-3 font-medium">Button</th>
              <th className="text-left px-4 py-3 font-medium">Tier Interest</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{entry.email}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{entry.source || "unknown"}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{entry.buttonLabel || "—"}</td>
                  <td className="px-4 py-3">
                    {entry.tier ? (
                      <Badge className={`text-xs ${
                        entry.tier === "pro" ? "bg-blue-100 text-blue-700" :
                        entry.tier === "trade" ? "bg-amber-100 text-amber-700" :
                        "bg-muted text-muted-foreground"
                      }`}>{entry.tier}</Badge>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No waitlist signups yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

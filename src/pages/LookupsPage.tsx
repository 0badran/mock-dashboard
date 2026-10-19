import { useState, useMemo, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderOpen,
  ChevronRight,
  Settings,
  Info,
  Type,
  Database,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useMockCollection, type LookupItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LookupFormData {
  category: string;
  key: string;
  value: string;
  name_ar: string;
  name_en: string;
  display_order: number;
  is_active: boolean;
  status: "approved" | "pending" | "rejected";
  description_ar: string;
  description_en: string;
  has_children: boolean;
  parent_id: string | null;
}

export default function LookupsPage() {
  const { t } = useTranslation();
  const { data: lookups, add, update, remove } = useMockCollection<LookupItem>("lookups");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [approvalFilter, setApprovalFilter] = useState<string>("ALL");

  // Parent drill-in stack (matching source project drill-in behavior)
  const [parentStack, setParentStack] = useState<LookupItem[]>([]);
  const activeParent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;

  // Modals state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLookup, setEditingLookup] = useState<LookupItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailLookup, setDetailLookup] = useState<LookupItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [lookupToDelete, setLookupToDelete] = useState<LookupItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<LookupFormData>({
    category: "أنواع المناسبات",
    key: "",
    value: "",
    name_ar: "",
    name_en: "",
    display_order: 1,
    is_active: true,
    status: "approved",
    description_ar: "",
    description_en: "",
    has_children: false,
    parent_id: null,
  });

  // Unique categories with counts
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    lookups.forEach((l) => {
      const cat = l.category || "عام";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([title, count]) => ({
      title,
      count,
    }));
  }, [lookups]);

  const categories = useMemo(() => {
    return categoryStats.map((cs) => cs.title);
  }, [categoryStats]);

  // Filtered Lookups
  const filteredLookups = useMemo(() => {
    return lookups
      .filter((l) => {
        // Parent drill-in filter
        if (activeParent) {
          if (l.parent_id !== activeParent.id && l.id !== activeParent.id) return false;
        }

        // Type / Category filter
        if (selectedType !== "ALL" && l.category !== selectedType) {
          return false;
        }

        // Status Filter
        if (statusFilter === "1" && !l.is_active) return false;
        if (statusFilter === "0" && l.is_active) return false;

        // Approval Filter
        if (approvalFilter !== "ALL") {
          const itemStatus = l.status?.value || "approved";
          if (itemStatus !== approvalFilter) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            (l.name && l.name.toLowerCase().includes(q)) ||
            (l.value && l.value.toLowerCase().includes(q)) ||
            (l.name_ar && l.name_ar.toLowerCase().includes(q)) ||
            (l.name_en && l.name_en.toLowerCase().includes(q)) ||
            (l.key && l.key.toLowerCase().includes(q)) ||
            (l.lookup_code && l.lookup_code.toLowerCase().includes(q)) ||
            (l.category && l.category.toLowerCase().includes(q)) ||
            (l.description && l.description.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [lookups, activeParent, selectedType, statusFilter, approvalFilter, searchQuery]);

  // Handlers
  const handleAddClick = () => {
    setEditingLookup(null);
    const defaultCategory =
      selectedType !== "ALL" ? selectedType : categories[0] || "أنواع المناسبات";
    setFormData({
      category: defaultCategory,
      key: "",
      value: "",
      name_ar: "",
      name_en: "",
      display_order: filteredLookups.length + 1,
      is_active: true,
      status: "approved",
      description_ar: "",
      description_en: "",
      has_children: false,
      parent_id: activeParent ? activeParent.id : null,
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (lok: LookupItem) => {
    setEditingLookup(lok);
    setFormData({
      category: lok.category,
      key: lok.key || lok.lookup_code || "",
      value: lok.value || lok.name || "",
      name_ar: lok.name_ar || lok.name || lok.value || "",
      name_en: lok.name_en || lok.key || "",
      display_order: lok.display_order ?? 1,
      is_active: lok.is_active ?? true,
      status: lok.status?.value || "approved",
      description_ar: lok.description_ar || lok.description || "",
      description_en: lok.description_en || "",
      has_children: lok.has_children ?? false,
      parent_id: lok.parent_id || null,
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (lok: LookupItem) => {
    setDetailLookup(lok);
    setIsDetailsOpen(true);
  };

  const handleDrillIn = (lok: LookupItem) => {
    setParentStack((prev) => [...prev, lok]);
  };

  const handlePopParent = (index?: number) => {
    if (index === undefined) {
      setParentStack([]);
    } else {
      setParentStack((prev) => prev.slice(0, index + 1));
    }
  };

  const handleToggleActive = (lok: LookupItem) => {
    const updatedActive = !lok.is_active;
    update(lok.id, { is_active: updatedActive });
    toast.success(t("common.itemUpdated"));
  };

  const handleToggleStatus = (lok: LookupItem, newStatus: "approved" | "rejected") => {
    const label = newStatus === "approved" ? t("lookups.approved") : t("lookups.rejected");
    update(lok.id, {
      status: { label, value: newStatus },
    });
    toast.success(t("common.itemUpdated"));
  };

  const handleDeleteClick = (lok: LookupItem) => {
    setLookupToDelete(lok);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!lookupToDelete) return;
    remove(lookupToDelete.id);
    toast.success(t("common.itemDeleted"));
    setIsDeleteConfirmOpen(false);
    setLookupToDelete(null);
    if (detailLookup?.id === lookupToDelete.id) {
      setIsDetailsOpen(false);
      setDetailLookup(null);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.key.trim() || !formData.name_ar.trim()) return;

    const statusLabel =
      formData.status === "approved"
        ? t("lookups.approved")
        : formData.status === "pending"
          ? t("lookups.pending")
          : t("lookups.rejected");

    const payload: Omit<LookupItem, "id"> = {
      category: formData.category.trim(),
      key: formData.key.trim().toUpperCase(),
      value: formData.name_ar.trim(),
      name: formData.name_ar.trim(),
      name_ar: formData.name_ar.trim(),
      name_en: formData.name_en.trim() || formData.key.trim(),
      lookup_code: formData.key.trim().toUpperCase(),
      lookup_type: formData.category.trim(),
      display_order: Number(formData.display_order) || 1,
      is_active: formData.is_active,
      status: { label: statusLabel, value: formData.status },
      description: formData.description_ar || `${formData.name_ar} - ${formData.category}`,
      description_ar: formData.description_ar,
      description_en: formData.description_en,
      has_children: formData.has_children,
      parent_id: formData.parent_id,
    };

    if (editingLookup) {
      update(editingLookup.id, payload);
      toast.success(t("common.itemUpdated"));
    } else {
      add(payload);
      toast.success(t("common.itemCreated"));
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header (Matching Source PageHeader) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <LayoutGrid className="size-8 text-primary" />
            <span>{t("lookups.title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("lookups.subtitle")}
          </p>
        </div>
        <Button onClick={handleAddClick} className="gap-2">
          <Plus className="size-4" />
          <span>{t("lookups.addLookup")}</span>
        </Button>
      </div>

      {/* Shared Filter Bar (Matching Source SharedFilter) */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-end gap-3">
          {/* Search Input */}
          <div className="flex-1 space-y-1.5">
            <Label variant="filter">{t("common.search")}</Label>
            <div className="relative">
              <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t("lookups.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
          </div>

          {/* Status Dropdown Filter */}
          <div className="w-full md:w-52 space-y-1.5">
            <Label variant="filter">{t("common.status")}</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("common.all")}</SelectItem>
                <SelectItem value="1">{t("lookups.active")}</SelectItem>
                <SelectItem value="0">{t("lookups.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Approval Status Filter */}
          <div className="w-full md:w-52 space-y-1.5">
            <Label variant="filter">{t("lookups.status")}</Label>
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("common.all")}</SelectItem>
                <SelectItem value="approved">{t("lookups.approved")}</SelectItem>
                <SelectItem value="pending">{t("lookups.pending")}</SelectItem>
                <SelectItem value="rejected">{t("lookups.rejected")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Split Content (Sidebar for Types + Lookups Table) */}
      <main className="flex-1 flex flex-col 2xl:flex-row gap-4 min-h-125">
        {/* Left/Start Sidebar for Lookup Types (Matching Source Sidebar) */}
        <aside className="w-full 2xl:w-64 shrink-0 space-y-2">
          <div className="p-4 bg-card rounded-xl border">
            <h3 className="font-semibold mb-3 flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <Filter className="size-4 text-primary" />
                <span>{t("lookups.types")}</span>
              </span>
              <Badge variant="outline" className="text-xs font-mono">
                {lookups.length}
              </Badge>
            </h3>

            {/* Types Buttons List */}
            <div className="flex 2xl:flex-col gap-1.5 overflow-x-auto py-1 *:shrink-0 2xl:*:shrink">
              {/* All Types Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedType("ALL");
                  setParentStack([]);
                }}
                className={cn(
                  "w-fit 2xl:w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-start",
                  selectedType === "ALL"
                    ? "bg-primary text-primary-foreground font-medium shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{t("lookups.allTypes")}</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full ms-2",
                    selectedType === "ALL"
                      ? "bg-primary-foreground/20 text-primary-foreground font-mono"
                      : "bg-background text-muted-foreground font-mono"
                  )}
                >
                  {lookups.length}
                </span>
              </button>

              {/* Individual Category Buttons */}
              {categoryStats.map((cat) => {
                const isSelected = selectedType === cat.title;
                return (
                  <button
                    key={cat.title}
                    type="button"
                    onClick={() => {
                      setSelectedType(cat.title);
                      setParentStack([]);
                    }}
                    className={cn(
                      "w-fit 2xl:w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-start",
                      isSelected
                        ? "bg-primary text-primary-foreground font-medium shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{cat.title}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full ms-2 shrink-0",
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground font-mono"
                          : "bg-background text-muted-foreground font-mono"
                      )}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right/End Content Area (Lookups Table) */}
        <div className="w-full flex-1 min-w-0 space-y-3">
          {/* Breadcrumb Navigation when drilled into a parent lookup */}
          {parentStack.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-card rounded-lg border text-sm">
              <button
                type="button"
                onClick={() => handlePopParent()}
                className="text-primary hover:underline font-medium"
              >
                {t("lookups.allTypes")}
              </button>
              {parentStack.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 text-muted-foreground rtl:rotate-180" />
                  <button
                    type="button"
                    onClick={() => handlePopParent(idx)}
                    className={cn(
                      "font-medium",
                      idx === parentStack.length - 1
                        ? "text-foreground cursor-default"
                        : "text-primary hover:underline"
                    )}
                  >
                    {p.name || p.value}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Table Container (Matching Source LookupsTable) */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-16 font-semibold">#ID</TableHead>
                  <TableHead className="font-semibold">{t("lookups.value")}</TableHead>
                  <TableHead className="font-semibold">{t("lookups.category")}</TableHead>
                  <TableHead className="font-semibold text-center w-24">
                    {t("lookups.displayOrder")}
                  </TableHead>
                  <TableHead className="font-semibold w-24">{t("common.status")}</TableHead>
                  <TableHead className="font-semibold w-28">{t("lookups.status")}</TableHead>
                  <TableHead className="font-semibold text-end w-20">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLookups.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-36 text-center text-muted-foreground"
                    >
                      <Database className="size-8 mx-auto mb-2 opacity-40" />
                      <p className="font-medium">{t("common.noData")}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLookups.map((lok) => (
                    <TableRow
                      key={lok.id}
                      onClick={() => handleViewDetails(lok)}
                      className="group cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      {/* ID Cell */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{lok.id}
                      </TableCell>

                      {/* Name & Code Cell with optional drill-in */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {lok.name || lok.value}
                            </span>
                            {(lok.lookup_code || lok.key) && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {lok.lookup_code || lok.key}
                              </span>
                            )}
                          </div>

                          {/* Drill-in indicator for items with children (Matching source) */}
                          {lok.has_children && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDrillIn(lok);
                              }}
                              className="ms-1 inline-flex items-center gap-1 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-2 py-0.5 transition-colors"
                              title={t("lookups.viewChildren")}
                            >
                              <FolderOpen className="size-3" />
                              <span>{t("lookups.children")}</span>
                              <ChevronRight className="size-3 rtl:rotate-180" />
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Category Badge Cell */}
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {lok.category}
                        </Badge>
                      </TableCell>

                      {/* Display Order Cell */}
                      <TableCell className="text-center font-mono text-xs">
                        {lok.display_order ?? 1}
                      </TableCell>

                      {/* Active Status Badge Cell */}
                      <TableCell>
                        <Badge
                          variant={lok.is_active ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {lok.is_active ? t("lookups.active") : t("lookups.inactive")}
                        </Badge>
                      </TableCell>

                      {/* Approval Status Badge Cell */}
                      <TableCell>
                        <Badge
                          variant={lok.status?.value === "approved" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {lok.status?.label || t("lookups.approved")}
                        </Badge>
                      </TableCell>

                      {/* Actions Cell with DropdownMenu (Matching Source ActionsDropDown) */}
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(lok)}
                              className="gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5" />
                              <span>{t("lookups.details")}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleEditClick(lok)}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit2 className="size-3.5" />
                              <span>{t("common.edit")}</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleToggleActive(lok)}
                              className="gap-2 cursor-pointer"
                            >
                              {lok.is_active ? (
                                <>
                                  <XCircle className="size-3.5 text-muted-foreground" />
                                  <span>{t("lookups.inactive")}</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                                  <span>{t("lookups.active")}</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(
                                  lok,
                                  lok.status?.value === "approved" ? "rejected" : "approved"
                                )
                              }
                              className="gap-2 cursor-pointer"
                            >
                              {lok.status?.value === "approved" ? (
                                <>
                                  <XCircle className="size-3.5 text-rose-500" />
                                  <span>{t("lookups.reject")}</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                                  <span>{t("lookups.approve")}</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(lok)}
                              className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                              <span>{t("common.delete")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Lookup Detail Modal (Faithfully Replicating Source LookupDetailPage.tsx) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {detailLookup && (
            <div className="space-y-6">
              {/* Header section with icon, name, status, and code */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b">
                <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <LayoutGrid className="size-8" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight">
                      {detailLookup.name || detailLookup.value}
                    </h2>
                    <Badge
                      variant={detailLookup.is_active ? "success" : "secondary"}
                      className="text-xs"
                    >
                      {detailLookup.is_active ? t("lookups.active") : t("lookups.inactive")}
                    </Badge>
                    <Badge
                      variant={detailLookup.status?.value === "approved" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {detailLookup.status?.label || t("lookups.approved")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-mono bg-muted/60 px-2 py-0.5 rounded">
                      #{detailLookup.lookup_code || detailLookup.key}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-foreground">
                      {detailLookup.category}
                    </span>
                    <span>•</span>
                    <span>#{detailLookup.id}</span>
                  </div>
                </div>
              </div>

              {/* Localized Descriptions (Matching Source) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Info className="size-3.5" />
                  <span>{t("lookups.description")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-muted/30 border space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {t("lookups.descriptionAr")}
                    </span>
                    <p className="text-sm text-foreground">
                      {detailLookup.description_ar ||
                        detailLookup.description ||
                        detailLookup.value}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/30 border space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {t("lookups.descriptionEn")}
                    </span>
                    <p className="text-sm text-foreground">
                      {detailLookup.description_en || detailLookup.key}
                    </p>
                  </div>
                </div>
              </div>

              {/* Localized Names (Matching Source) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Type className="size-3.5" />
                  <span>{t("lookups.translations")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-card border flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {t("lookups.nameAr")}
                    </span>
                    <span className="font-semibold text-sm">
                      {detailLookup.name_ar || detailLookup.value}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {t("lookups.nameEn")}
                    </span>
                    <span className="font-semibold text-sm">
                      {detailLookup.name_en || detailLookup.key}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-card border flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {t("lookups.key")}
                    </span>
                    <span className="font-mono text-sm font-semibold">
                      {detailLookup.lookup_code || detailLookup.key}
                    </span>
                  </div>
                </div>
              </div>

              {/* Configuration Stats (Matching Source) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Settings className="size-3.5" />
                  <span>{t("lookups.configuration")}</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("lookups.displayOrder")}
                    </span>
                    <span className="font-bold text-base font-mono">
                      {detailLookup.display_order ?? 1}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("lookups.parent")}
                    </span>
                    <span className="font-medium text-xs">
                      {detailLookup.parent_id || t("lookups.rootLevel")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dialog Footer Actions */}
              <DialogFooter className="gap-3 sm:gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  {t("common.close")}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleEditClick(detailLookup);
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="size-3.5" />
                  <span>{t("common.edit")}</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog (Matching Source LookupDialog.tsx) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingLookup ? t("lookups.editLookup") : t("lookups.addLookup")}
            </DialogTitle>
            <DialogDescription>{t("lookups.subtitle")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            {/* Arabic Name & English Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("lookups.nameAr")}</Label>
                <Input
                  required
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name_ar: e.target.value,
                      value: e.target.value,
                    })
                  }
                  placeholder="مثال: حفل زفاف، كبار الشخصيات..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("lookups.nameEn")}</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                  placeholder="e.g. Wedding, VIP..."
                />
              </div>
            </div>

            {/* Category / Type & Code / Key */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("lookups.category")}</Label>
                <div className="space-y-2">
                  <Select
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("lookups.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="أو اكتب نوع جديد..."
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("lookups.key")}</Label>
                <Input
                  required
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value.toUpperCase() })
                  }
                  placeholder="WEDDING, VIP, FIRST_DEGREE..."
                  className="font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Display Order & Approval Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("lookups.displayOrder")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("lookups.status")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: "approved" | "pending" | "rejected") =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">{t("lookups.approved")}</SelectItem>
                    <SelectItem value="pending">{t("lookups.pending")}</SelectItem>
                    <SelectItem value="rejected">{t("lookups.rejected")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("lookups.descriptionAr")}</Label>
                <Input
                  value={formData.description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, description_ar: e.target.value })
                  }
                  placeholder="وصف توضيحي بالعربية..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("lookups.descriptionEn")}</Label>
                <Input
                  value={formData.description_en}
                  onChange={(e) =>
                    setFormData({ ...formData, description_en: e.target.value })
                  }
                  placeholder="English description..."
                />
              </div>
            </div>

            {/* Checkboxes / Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
                <span className="font-medium">{t("lookups.active")}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.has_children}
                  onChange={(e) =>
                    setFormData({ ...formData, has_children: e.target.checked })
                  }
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
                <span className="font-medium">{t("lookups.children")}</span>
              </label>
            </div>

            <DialogFooter className="gap-3 sm:gap-3 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unified Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title={t("lookups.confirmDelete")}
        description={t("lookups.confirmDeleteDesc")}
        itemName={
          lookupToDelete
            ? `${lookupToDelete.name || lookupToDelete.value} (${lookupToDelete.lookup_code || lookupToDelete.key})`
            : undefined
        }
      />
    </div>
  );
}

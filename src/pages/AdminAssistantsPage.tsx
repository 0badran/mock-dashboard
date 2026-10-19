import { useState, useMemo, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Mail, Search, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMockCollection, type AssistantItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function AdminAssistantsPage() {
  const { t } = useTranslation();
  const { data: assistants, add, update, remove } =
    useMockCollection<AssistantItem>("adminAssistants");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<AssistantItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assistantToDelete, setAssistantToDelete] = useState<AssistantItem | null>(null);

  const [formData, setFormData] = useState<Omit<AssistantItem, "id">>({
    name: "",
    email: "",
    role: "منسق فعاليات",
    lastLogin: "الآن",
    status: "active",
  });

  const filtered = useMemo(() => {
    return assistants.filter((ast) => {
      const matchesSearch =
        ast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ast.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ast.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || ast.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assistants, searchTerm, statusFilter]);

  const handleOpenCreate = () => {
    setEditingAssistant(null);
    setFormData({
      name: "",
      email: "",
      role: "منسق فعاليات",
      lastLogin: "الآن",
      status: "active",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ast: AssistantItem) => {
    setEditingAssistant(ast);
    setFormData({
      name: ast.name,
      email: ast.email,
      role: ast.role,
      lastLogin: ast.lastLogin,
      status: ast.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingAssistant) {
      update(editingAssistant.id, formData);
      toast.success(t("common.itemUpdated"));
    } else {
      add(formData);
      toast.success(t("common.itemCreated"));
    }
    setModalOpen(false);
  };

  const handleDeletePrompt = (ast: AssistantItem) => {
    setAssistantToDelete(ast);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!assistantToDelete) return;
    remove(assistantToDelete.id);
    toast.success(t("common.itemDeleted"));
    setDeleteConfirmOpen(false);
    setAssistantToDelete(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {t("adminAssistants.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adminAssistants.subtitle")}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-1.5">
          <Plus className="size-4" />
          <span>{t("adminAssistants.addAssistant")}</span>
        </Button>
      </div>

      {/* Isolated Filter Bar */}
      <Card className="rounded-2xl border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label variant="filter">{t("common.search")}</Label>
              <div className="relative">
                <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t("common.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-9"
                />
              </div>
            </div>

            <div className="w-full sm:w-48 space-y-1">
              <Label variant="filter">{t("adminAssistants.status")}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("common.all")}</SelectItem>
                  <SelectItem value="active">{t("adminAssistants.active")}</SelectItem>
                  <SelectItem value="inactive">{t("adminAssistants.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Container */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>{t("adminAssistants.name")}</TableHead>
              <TableHead>{t("adminAssistants.role")}</TableHead>
              <TableHead>{t("adminAssistants.lastLogin")}</TableHead>
              <TableHead>{t("adminAssistants.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <ShieldCheck className="size-8 mx-auto mb-2 opacity-40" />
                  <p>{t("common.noData")}</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ast) => (
                <TableRow key={ast.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                          {getInitials(ast.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{ast.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="size-3" />
                          {ast.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {ast.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {ast.lastLogin}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ast.status === "active" ? "success" : "secondary"}
                      className="text-xs"
                    >
                      {t(`adminAssistants.${ast.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(ast)}
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeletePrompt(ast)}
                      >
                        <Trash2 className="size-3.5 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAssistant
                ? t("adminAssistants.editAssistant")
                : t("adminAssistants.addAssistant")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label>{t("adminAssistants.name")}</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("adminAssistants.email")}</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("adminAssistants.role")}</Label>
              <Input
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-3 sm:gap-3 pt-2">
              <Button type="button" variant="outline" size="lg" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button size="lg" type="submit">
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        itemName={assistantToDelete ? `${assistantToDelete.name} (${assistantToDelete.role})` : undefined}
      />
    </div>
  );
}

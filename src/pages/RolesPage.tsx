import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Shield, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMockCollection, type RoleItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function RolesPage() {
  const { t } = useTranslation();
  const { data: roles, add, update, remove } = useMockCollection<RoleItem>("roles");

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  const [formData, setFormData] = useState<Omit<RoleItem, "id">>({
    roleName: "",
    description: "",
    usersCount: 1,
  });

  const filtered = roles.filter(
    (r) =>
      r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({ roleName: "", description: "", usersCount: 1 });
    setModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setFormData({
      roleName: role.roleName,
      description: role.description,
      usersCount: role.usersCount,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.roleName) return;

    if (editingRole) {
      update(editingRole.id, formData);
      toast.success(t("common.itemUpdated"));
    } else {
      add(formData);
      toast.success(t("common.itemCreated"));
    }
    setModalOpen(false);
  };

  const handleDeletePrompt = (role: RoleItem) => {
    setRoleToDelete(role);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!roleToDelete) return;
    remove(roleToDelete.id);
    toast.success(t("common.itemDeleted"));
    setDeleteConfirmOpen(false);
    setRoleToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {t("roles.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("roles.subtitle")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-1.5">
          <Plus className="size-4" />
          <span>{t("roles.addRole")}</span>
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
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          <p>{t("common.noData")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className="rounded-2xl border bg-card p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Shield className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base leading-tight">
                      {r.roleName}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {r.usersCount} {t("roles.users")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {r.description}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-border/40 flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(r)}>
                  <Edit2 className="size-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePrompt(r)}>
                  <Trash2 className="size-3.5 text-rose-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? t("roles.editRole") : t("roles.addRole")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label>{t("roles.roleName")}</Label>
              <Input
                required
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("roles.description")}</Label>
              <Input
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("roles.usersCount")}</Label>
              <Input
                type="number"
                value={formData.usersCount}
                onChange={(e) =>
                  setFormData({ ...formData, usersCount: Number(e.target.value) })
                }
              />
            </div>
            <DialogFooter className="gap-3 sm:gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">
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
        itemName={roleToDelete ? roleToDelete.roleName : undefined}
      />
    </div>
  );
}

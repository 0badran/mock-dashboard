import { useState, useMemo, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Calendar, Search, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMockCollection, type MemoryItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function MemoriesPage() {
  const { t } = useTranslation();
  const { data: memories, add, remove } = useMockCollection<MemoryItem>("memories");

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MemoryItem | null>(null);

  const [formData, setFormData] = useState<Omit<MemoryItem, "id">>({
    event: "حفل زفاف سارة ومحمد",
    caption: "",
    date: new Date().toISOString().split("T")[0],
    mediaUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
  });

  const filtered = useMemo(() => {
    return memories.filter(
      (mem) =>
        mem.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mem.event.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [memories, searchTerm]);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.caption) return;
    add(formData);
    toast.success(t("common.itemCreated"));
    setModalOpen(false);
  };

  const handleDeletePrompt = (mem: MemoryItem) => {
    setItemToDelete(mem);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    remove(itemToDelete.id);
    toast.success(t("common.itemDeleted"));
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {t("memories.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("memories.subtitle")}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          <span>{t("memories.addMemory")}</span>
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

      {/* Memories Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          <ImageIcon className="size-10 mx-auto mb-3 opacity-40" />
          <p>{t("common.noData")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((mem) => (
            <Card key={mem.id} className="rounded-2xl border bg-card overflow-hidden group hover:shadow-md transition-all">
              <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                <img
                  src={mem.mediaUrl}
                  alt={mem.caption}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Button
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => handleDeletePrompt(mem)}
                  className="absolute top-2 inset-e-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <CardContent className="p-4 space-y-1">
                <h3 className="font-semibold text-sm leading-tight">{mem.caption}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{mem.event}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="size-3" />
                    {mem.date}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("memories.addMemory")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <Label>{t("memories.event")}</Label>
              <Input
                required
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("memories.caption")}</Label>
              <Input
                required
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("memories.mediaUrl")}</Label>
              <Input
                required
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
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
        itemName={itemToDelete ? `${itemToDelete.caption} (${itemToDelete.event})` : undefined}
      />
    </div>
  );
}

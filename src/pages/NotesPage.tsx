import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMockCollection, type NoteItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function NotesPage() {
  const { t } = useTranslation();
  const { data: notes, add, update, remove } = useMockCollection<NoteItem>("notes");

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<NoteItem | null>(null);

  const [formData, setFormData] = useState<Omit<NoteItem, "id">>({
    subject: "",
    content: "",
    priority: "medium",
    date: new Date().toISOString().split("T")[0],
  });

  const filtered = notes.filter((n) => {
    const matchesSearch =
      n.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "ALL" || n.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleOpenCreate = () => {
    setEditingNote(null);
    setFormData({
      subject: "",
      content: "",
      priority: "medium",
      date: new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (n: NoteItem) => {
    setEditingNote(n);
    setFormData({
      subject: n.subject,
      content: n.content,
      priority: n.priority,
      date: n.date,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.subject) return;

    if (editingNote) {
      update(editingNote.id, formData);
      toast.success(t("common.itemUpdated"));
    } else {
      add(formData);
      toast.success(t("common.itemCreated"));
    }
    setModalOpen(false);
  };

  const handleDeletePrompt = (n: NoteItem) => {
    setNoteToDelete(n);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!noteToDelete) return;
    remove(noteToDelete.id);
    toast.success(t("common.itemDeleted"));
    setDeleteConfirmOpen(false);
    setNoteToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {t("notes.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("notes.subtitle")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-1.5 shrink-0">
          <Plus className="size-4" />
          <span>{t("notes.addNote")}</span>
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
              <Label variant="filter">{t("notes.priority")}</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("common.all")}</SelectItem>
                  <SelectItem value="high">{t("notes.high")}</SelectItem>
                  <SelectItem value="medium">{t("notes.medium")}</SelectItem>
                  <SelectItem value="low">{t("notes.low")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          <p>{t("common.noData")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <Card
              key={note.id}
              className="rounded-2xl border bg-card p-5 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base leading-tight">
                    {note.subject}
                  </h3>
                  <Badge
                    variant={
                      note.priority === "high"
                        ? "destructive"
                        : note.priority === "medium"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {t(`notes.${note.priority}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>{note.date}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(note)}>
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePrompt(note)}>
                    <Trash2 className="size-3.5 text-rose-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNote ? t("notes.editNote") : t("notes.addNote")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label>{t("notes.subject")}</Label>
              <Input
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("notes.priority")}</Label>
              <Select
                value={formData.priority}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    priority: val as NoteItem["priority"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t("notes.high")}</SelectItem>
                  <SelectItem value="medium">{t("notes.medium")}</SelectItem>
                  <SelectItem value="low">{t("notes.low")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("notes.content")}</Label>
              <textarea
                className="w-full min-h-25 rounded-md border border-input bg-background p-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
        itemName={noteToDelete ? noteToDelete.subject : undefined}
      />
    </div>
  );
}

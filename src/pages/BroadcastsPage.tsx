import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Search, Trash2, Bell, Send, Users } from "lucide-react";
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
import { useMockCollection, type BroadcastItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function BroadcastsPage() {
  const { t } = useTranslation();
  const { data: broadcasts, add, remove } = useMockCollection<BroadcastItem>("broadcasts");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState<BroadcastItem | null>(null);

  const [formData, setFormData] = useState<Omit<BroadcastItem, "id">>({
    title: "",
    message: "",
    audience: "جميع المدعوين المؤكدين",
    sentDate: "الآن",
    recipients: 150,
    status: "sent",
  });

  const filtered = broadcasts.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.message.toLowerCase().includes(searchTerm.toLowerCase());
    const isSent = b.status === "sent" || b.status === "تم الإرسال";
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "sent" && isSent) ||
      (statusFilter === "scheduled" && !isSent);
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    const now = new Date();
    const dateStr = `${now.toISOString().split("T")[0]} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    add({
      ...formData,
      sentDate: dateStr,
    });

    toast.success(t("broadcasts.broadcastSent"));
    setModalOpen(false);
  };

  const handleDeletePrompt = (b: BroadcastItem) => {
    setBroadcastToDelete(b);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!broadcastToDelete) return;
    remove(broadcastToDelete.id);
    toast.success(t("common.itemDeleted"));
    setDeleteConfirmOpen(false);
    setBroadcastToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {t("broadcasts.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("broadcasts.subtitle")}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-1.5 shrink-0">
          <Send className="size-4" />
          <span>{t("broadcasts.sendBroadcast")}</span>
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
              <Label variant="filter">{t("broadcasts.status")}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("common.all")}</SelectItem>
                  <SelectItem value="sent">{t("broadcasts.sent")}</SelectItem>
                  <SelectItem value="scheduled">{t("broadcasts.scheduled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broadcasts Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          <p>{t("common.noData")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <Card key={b.id} className="rounded-2xl border bg-card p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Bell className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base">{b.title}</h3>
                  </div>
                  <Badge
                    variant={
                      b.status === "sent" || b.status === "تم الإرسال"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {b.status === "sent" || b.status === "تم الإرسال"
                      ? t("broadcasts.sent")
                      : t("broadcasts.scheduled")}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40 whitespace-pre-wrap">
                  {b.message}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-primary" />
                    {b.recipients} {t("common.recipients")}
                  </span>
                  <span>•</span>
                  <span>{b.sentDate}</span>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => handleDeletePrompt(b)}>
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
            <DialogTitle>{t("broadcasts.sendBroadcast")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label>{t("broadcasts.titleField")}</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان الرسالة (تذكير، إشعار، موقع القاعة)"
              />
            </div>
            <div>
              <Label>{t("broadcasts.audience")}</Label>
              <Select
                value={formData.audience}
                onValueChange={(val) => setFormData({ ...formData, audience: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="جميع المدعوين المؤكدين">{t("broadcasts.allGuests")}</SelectItem>
                  <SelectItem value="كبار الشخصيات فقط">{t("broadcasts.vipOnly")}</SelectItem>
                  <SelectItem value="الذين لم يؤكدوا بعد">{t("broadcasts.unconfirmedOnly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("broadcasts.message")}</Label>
              <textarea
                className="w-full min-h-25 rounded-md border border-input bg-background p-3 text-sm shadow-xs"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="اكتب نص الرسالة هنا..."
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        itemName={broadcastToDelete ? broadcastToDelete.title : undefined}
      />
    </div>
  );
}

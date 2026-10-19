import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	Calendar,
	MapPin,
	Users,
	Clock,
	CalendarCheck2,
} from "lucide-react";
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
import { useMockCollection, type EventItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function EventsPage() {
	const { t } = useTranslation();
	const {
		data: events,
		add,
		update,
		remove,
	} = useMockCollection<EventItem>("events");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

	const [formData, setFormData] = useState<Omit<EventItem, "id">>({
		title: "",
		client: "",
		date: "2026-11-20",
		time: "20:00",
		hall: "قاعة لونا الكبرى",
		capacity: 250,
		status: "planned",
	});

	const filteredEvents = useMemo(() => {
		return events.filter((e) => {
			const query = searchTerm.toLowerCase();
			const matchesSearch =
				e.title.toLowerCase().includes(query) ||
				e.client.toLowerCase().includes(query) ||
				e.hall.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === "all" || e.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [events, searchTerm, statusFilter]);

	const handleOpenCreate = () => {
		setEditingEvent(null);
		setFormData({
			title: "",
			client: "",
			date: "2026-12-10",
			time: "20:00",
			hall: "قاعة لونا الكبرى",
			capacity: 300,
			status: "planned",
		});
		setModalOpen(true);
	};

	const handleOpenEdit = (evt: EventItem) => {
		setEditingEvent(evt);
		setFormData({
			title: evt.title,
			client: evt.client,
			date: evt.date,
			time: evt.time,
			hall: evt.hall,
			capacity: evt.capacity,
			status: evt.status,
		});
		setModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.title) {
			toast.error(t("events.titleField"));
			return;
		}

		if (editingEvent) {
			update(editingEvent.id, formData);
			toast.success(t("common.itemUpdated"));
		} else {
			add(formData);
			toast.success(t("common.itemCreated"));
		}
		setModalOpen(false);
	};

	const handleDeletePrompt = (evt: EventItem) => {
		setEventToDelete(evt);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!eventToDelete) return;
		remove(eventToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setEventToDelete(null);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<CalendarCheck2 className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("events.title")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("events.subtitle")}
						</p>
					</div>
				</div>
				<Button onClick={handleOpenCreate} className="gap-1.5">
					<Plus className="size-4" />
					<span>{t("events.addEvent")}</span>
				</Button>
			</div>

			{/* Filter Card (Separated) */}
			<Card className="rounded-2xl border bg-card">
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
						<div className="flex-1 space-y-1.5">
							<Label variant="filter">{t("common.search")}</Label>
							<div className="relative">
								<Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
								<Input
									placeholder={t("common.search")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pe-9"
								/>
							</div>
						</div>

						<div className="w-full sm:w-48 space-y-1.5">
							<Label variant="filter">{t("events.status")}</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder={t("common.all")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("common.all")}</SelectItem>
									<SelectItem value="planned">
										{t("events.planned")}
									</SelectItem>
									<SelectItem value="ongoing">
										{t("events.ongoing")}
									</SelectItem>
									<SelectItem value="completed">
										{t("events.completed")}
									</SelectItem>
									<SelectItem value="cancelled">
										{t("events.cancelled")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Cards Grid */}
			{filteredEvents.length === 0 ? (
				<div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
					{t("common.noData")}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredEvents.map((evt) => (
						<div
							key={evt.id}
							className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 hover:shadow-xs transition-shadow relative"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="space-y-1">
									<h3 className="font-semibold text-base leading-tight">
										{evt.title}
									</h3>
									<p className="text-xs text-muted-foreground">{evt.client}</p>
								</div>
								<Badge
									variant={evt.status === "ongoing" ? "success" : "secondary"}
									className="capitalize text-xs shrink-0"
								>
									{t(`events.${evt.status}`)}
								</Badge>
							</div>

							<div className="space-y-2 text-xs text-muted-foreground pt-1">
								<div className="flex items-center gap-2">
									<Calendar className="size-3.5 text-primary" />
									<span>{evt.date}</span>
									<span>•</span>
									<Clock className="size-3.5 text-primary" />
									<span>{evt.time}</span>
								</div>
								<div className="flex items-center gap-2">
									<MapPin className="size-3.5 text-primary" />
									<span>{evt.hall}</span>
								</div>
								<div className="flex items-center gap-2">
									<Users className="size-3.5 text-primary" />
									<span>
										{t("events.capacity")}: {evt.capacity} {t("events.person")}
									</span>
								</div>
							</div>

							<div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
								<Button
									variant="ghost"
									size="icon-xs"
									onClick={() => handleOpenEdit(evt)}
									title={t("events.editEvent")}
								>
									<Edit2 className="size-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="icon-xs"
									onClick={() => handleDeletePrompt(evt)}
									title={t("common.delete")}
								>
									<Trash2 className="size-3.5 text-rose-500" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingEvent ? t("events.editEvent") : t("events.addEvent")}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4 py-2">
						<div>
							<Label>{t("events.titleField")}</Label>
							<Input
								required
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder={t("events.titleField")}
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<Label>{t("events.client")}</Label>
								<Input
									value={formData.client}
									onChange={(e) =>
										setFormData({ ...formData, client: e.target.value })
									}
									placeholder={t("events.client")}
								/>
							</div>
							<div>
								<Label>{t("events.capacity")}</Label>
								<Input
									type="number"
									min="1"
									value={formData.capacity}
									onChange={(e) =>
										setFormData({
											...formData,
											capacity: Number(e.target.value),
										})
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<Label>{t("events.date")}</Label>
								<Input
									type="date"
									value={formData.date}
									onChange={(e) =>
										setFormData({ ...formData, date: e.target.value })
									}
								/>
							</div>
							<div>
								<Label>{t("events.time")}</Label>
								<Input
									value={formData.time}
									onChange={(e) =>
										setFormData({ ...formData, time: e.target.value })
									}
									placeholder="20:00"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<Label>{t("events.hall")}</Label>
								<Input
									value={formData.hall}
									onChange={(e) =>
										setFormData({ ...formData, hall: e.target.value })
									}
									placeholder={t("events.hall")}
								/>
							</div>
							<div>
								<Label>{t("events.status")}</Label>
								<Select
									value={formData.status}
									onValueChange={(val) =>
										setFormData({
											...formData,
											status: val as EventItem["status"],
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="planned">
											{t("events.planned")}
										</SelectItem>
										<SelectItem value="ongoing">
											{t("events.ongoing")}
										</SelectItem>
										<SelectItem value="completed">
											{t("events.completed")}
										</SelectItem>
										<SelectItem value="cancelled">
											{t("events.cancelled")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter className="gap-2 sm:gap-0 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setModalOpen(false)}
							>
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
				itemName={eventToDelete ? `${eventToDelete.title} (${eventToDelete.date})` : undefined}
			/>
		</div>
	);
}

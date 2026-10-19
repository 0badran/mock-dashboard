import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MailOpen, Plus, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockCollection, type RsvpItem } from "@/services/mockStorage";
import { exportToCsv, useFileImport } from "@/lib/utils";
import { toast } from "sonner";
import { RsvpStatistics } from "@/components/rsvps/RsvpStatistics";
import { RsvpFilterCard } from "@/components/rsvps/RsvpFilterCard";
import { RsvpTable } from "@/components/rsvps/RsvpTable";
import { RsvpDetailsDialog } from "@/components/rsvps/RsvpDetailsDialog";
import { RsvpFormDialog } from "@/components/rsvps/RsvpFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export default function RsvpsPage() {
	const { t, i18n } = useTranslation();
	const {
		data: rsvps,
		add,
		update,
		remove,
	} = useMockCollection<RsvpItem>("rsvps");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [orderBy, setOrderBy] = useState<
		"created_at" | "name" | "phone" | "companions"
	>("created_at");
	const [orderDirection, setOrderDirection] = useState<"desc" | "asc">("desc");

	const [modalOpen, setModalOpen] = useState(false);
	const [editingRsvp, setEditingRsvp] = useState<RsvpItem | null>(null);
	const [viewingRsvp, setViewingRsvp] = useState<RsvpItem | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [rsvpToDelete, setRsvpToDelete] = useState<RsvpItem | null>(null);

	const { fileInputRef, triggerImport, handleFileChange } = useFileImport({
		successMessage: t("guests.importExcel"),
	});

	const [formData, setFormData] = useState<Omit<RsvpItem, "id">>({
		guestName: "",
		phone: "+966 50 ",
		eventName: "حفل زفاف سارة ومحمد",
		response: "attending",
		companions: 0,
		dietary: "regular",
		notes: "",
		createdAt: "2026-10-18",
	});

	// Top statistics calculations
	const totalRsvps = rsvps.length;
	const attendingCount = rsvps.filter((r) => r.response === "attending").length;
	const pendingCount = rsvps.filter((r) => r.response === "pending").length;
	const declinedCount = rsvps.filter((r) => r.response === "declined").length;
	const totalCompanions = rsvps.reduce(
		(acc, r) => acc + (r.companions || 0),
		0,
	);

	// Filter and Sort memoization
	const sortedAndFilteredRsvps = useMemo(() => {
		const result = rsvps.filter((r) => {
			const query = searchTerm.toLowerCase();
			const matchesSearch =
				r.guestName.toLowerCase().includes(query) ||
				r.phone.includes(query) ||
				r.eventName.toLowerCase().includes(query) ||
				(r.notes && r.notes.toLowerCase().includes(query));

			const matchesStatus =
				statusFilter === "all" || r.response === statusFilter;

			return matchesSearch && matchesStatus;
		});

		result.sort((a, b) => {
			let comp: number;
			if (orderBy === "name") {
				comp = a.guestName.localeCompare(b.guestName, i18n.language);
			} else if (orderBy === "phone") {
				comp = a.phone.localeCompare(b.phone);
			} else if (orderBy === "companions") {
				comp = (a.companions || 0) - (b.companions || 0);
			} else {
				const dateA = a.createdAt || "";
				const dateB = b.createdAt || "";
				comp = dateA.localeCompare(dateB);
			}
			return orderDirection === "asc" ? comp : -comp;
		});

		return result;
	}, [rsvps, searchTerm, statusFilter, orderBy, orderDirection, i18n.language]);

	const handleOpenCreate = () => {
		setEditingRsvp(null);
		setFormData({
			guestName: "",
			phone: "+966 50 ",
			eventName: "حفل زفاف سارة ومحمد",
			response: "attending",
			companions: 1,
			dietary: "regular",
			notes: "",
			createdAt: new Date().toISOString().split("T")[0],
		});
		setModalOpen(true);
	};

	const handleOpenEdit = (rsvp: RsvpItem) => {
		setEditingRsvp(rsvp);
		setFormData({
			guestName: rsvp.guestName,
			phone: rsvp.phone,
			eventName: rsvp.eventName,
			response: rsvp.response,
			companions: rsvp.companions,
			dietary: rsvp.dietary,
			notes: rsvp.notes || "",
			createdAt: rsvp.createdAt || "",
		});
		setModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.guestName.trim()) return;

		if (editingRsvp) {
			update(editingRsvp.id, formData);
			toast.success(t("common.itemUpdated"));
		} else {
			add(formData);
			toast.success(t("common.itemCreated"));
		}
		setModalOpen(false);
	};

	const handleDeletePrompt = (rsvp: RsvpItem) => {
		setRsvpToDelete(rsvp);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!rsvpToDelete) return;
		remove(rsvpToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setRsvpToDelete(null);
	};

	const handleExportExcel = () => {
		exportToCsv({
			filename: "rsvps-export",
			headers: [
				t("rsvps.guestName"),
				t("rsvps.phone"),
				t("rsvps.eventName"),
				t("rsvps.response"),
				t("rsvps.companions"),
				t("rsvps.dietary"),
				t("rsvps.notes"),
				t("guests.creationDate"),
			],
			rows: rsvps.map((r) => [
				r.guestName,
				r.phone,
				r.eventName,
				t(`rsvps.${r.response}`),
				r.companions,
				t(`rsvps.${r.dietary}`),
				r.notes || "",
				r.createdAt || "",
			]),
			successMessage: t("guests.exportExcel"),
		});
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<MailOpen className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("rsvps.title")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("rsvps.subtitle")}
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-wrap items-center gap-2">
					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept=".xlsx, .xls, .csv"
						onChange={handleFileChange}
					/>
					<Button variant="outline" onClick={triggerImport} className="gap-2">
						<Upload className="size-4" />
						<span>{t("guests.importExcel")}</span>
					</Button>

					<Button
						variant="outline"
						onClick={handleExportExcel}
						className="gap-2"
					>
						<Download className="size-4" />
						<span>{t("guests.exportExcel")}</span>
					</Button>

					<Button onClick={handleOpenCreate} className="gap-2">
						<Plus className="size-4" />
						<span>{t("rsvps.addRsvp")}</span>
					</Button>
				</div>
			</div>

			{/* Statistics Section */}
			<RsvpStatistics
				totalRsvps={totalRsvps}
				attendingCount={attendingCount}
				pendingCount={pendingCount}
				declinedCount={declinedCount}
				totalCompanions={totalCompanions}
				statusFilter={statusFilter}
				onSelectFilter={setStatusFilter}
			/>

			{/* Filter Card */}
			<RsvpFilterCard
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				orderDirection={orderDirection}
				onOrderDirectionChange={setOrderDirection}
				orderBy={orderBy}
				onOrderByChange={setOrderBy}
			/>

			{/* Table Card */}
			<RsvpTable
				rsvps={sortedAndFilteredRsvps}
				onSelectView={setViewingRsvp}
				onSelectEdit={handleOpenEdit}
				onDelete={handleDeletePrompt}
			/>

			{/* RSVP Details Dialog */}
			<RsvpDetailsDialog
				rsvp={viewingRsvp}
				open={!!viewingRsvp}
				onOpenChange={(open) => !open && setViewingRsvp(null)}
			/>

			{/* Create / Edit Dialog */}
			<RsvpFormDialog
				open={modalOpen}
				onOpenChange={setModalOpen}
				editingRsvp={editingRsvp}
				formData={formData}
				onFormChange={setFormData}
				onSubmit={handleSubmit}
			/>

			<ConfirmDialog
				open={deleteConfirmOpen}
				onOpenChange={setDeleteConfirmOpen}
				onConfirm={handleConfirmDelete}
				itemName={rsvpToDelete ? `${rsvpToDelete.guestName} (${rsvpToDelete.eventName})` : undefined}
			/>
		</div>
	);
}

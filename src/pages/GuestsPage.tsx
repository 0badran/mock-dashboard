import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	Users,
	Plus,
	Download,
	Upload,
	Search,
	Edit2,
	Trash2,
	Eye,
	Calendar,
	Mail,
	Phone,
	User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useMockCollection, type GuestItem } from "@/services/mockStorage";
import { formatDate, exportToCsv, useFileImport } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function GuestsPage() {
	const { t, i18n } = useTranslation();
	const {
		data: guests,
		add,
		update,
		remove,
	} = useMockCollection<GuestItem>("guests");

	const [searchTerm, setSearchTerm] = useState("");
	const [orderBy, setOrderBy] = useState<"created_at" | "name" | "phone">(
		"created_at",
	);
	const [orderDirection, setOrderDirection] = useState<"desc" | "asc">("desc");

	const [modalOpen, setModalOpen] = useState(false);
	const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
	const [viewingGuest, setViewingGuest] = useState<GuestItem | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [guestToDelete, setGuestToDelete] = useState<GuestItem | null>(null);

	const { fileInputRef, triggerImport, handleFileChange } = useFileImport({
		successMessage: t("guests.importExcel"),
	});

	const [formData, setFormData] = useState<Omit<GuestItem, "id">>({
		name: "",
		phone: "+966 50 ",
		email: "",
		eventName: "حفل زفاف سارة ومحمد",
		createdAt: "2026-09-27",
		clientName: "سارة ومحمد الشمري",
		category: "family",
		companions: 0,
		invitationStatus: "sent",
	});

	const sortedAndFilteredGuests = useMemo(() => {
		const result = guests.filter((g) => {
			const query = searchTerm.toLowerCase();
			return (
				g.name.toLowerCase().includes(query) ||
				g.phone.includes(query) ||
				(g.email && g.email.toLowerCase().includes(query)) ||
				(g.eventName && g.eventName.toLowerCase().includes(query)) ||
				(g.clientName && g.clientName.toLowerCase().includes(query))
			);
		});

		result.sort((a, b) => {
			let comp: number;
			if (orderBy === "name") {
				comp = a.name.localeCompare(b.name, i18n.language);
			} else if (orderBy === "phone") {
				comp = a.phone.localeCompare(b.phone);
			} else {
				const dateA = a.createdAt || "";
				const dateB = b.createdAt || "";
				comp = dateA.localeCompare(dateB);
			}
			return orderDirection === "asc" ? comp : -comp;
		});

		return result;
	}, [guests, searchTerm, orderBy, orderDirection, i18n.language]);

	const handleOpenCreate = () => {
		setEditingGuest(null);
		setFormData({
			name: "",
			phone: "+966 50 ",
			email: "",
			eventName: "حفل زفاف سارة ومحمد",
			createdAt: "2026-09-27",
			clientName: "سارة ومحمد الشمري",
			category: "family",
			companions: 0,
			invitationStatus: "sent",
		});
		setModalOpen(true);
	};

	const handleOpenEdit = (guest: GuestItem) => {
		setEditingGuest(guest);
		setFormData({
			name: guest.name,
			phone: guest.phone,
			email: guest.email || "",
			eventName: guest.eventName || guest.clientName || "",
			createdAt: guest.createdAt || "2026-09-27",
			clientName: guest.clientName || guest.eventName || "",
			category: guest.category || "family",
			companions: guest.companions || 0,
			invitationStatus: guest.invitationStatus || "sent",
		});
		setModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name) {
			toast.error(t("guests.name"));
			return;
		}

		if (editingGuest) {
			update(editingGuest.id, formData);
			toast.success(t("common.itemUpdated"));
		} else {
			add(formData);
			toast.success(t("common.itemCreated"));
		}
		setModalOpen(false);
	};

	const handleDeletePrompt = (guest: GuestItem) => {
		setGuestToDelete(guest);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!guestToDelete) return;
		remove(guestToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setGuestToDelete(null);
	};

	const handleExportExcel = () => {
		exportToCsv({
			filename: "guests",
			headers: [
				t("guests.name"),
				t("guests.phone"),
				t("guests.email"),
				t("guests.eventName"),
				t("guests.creationDate"),
			],
			rows: guests.map((g) => [
				g.name,
				g.phone,
				g.email || "",
				g.eventName || g.clientName || "",
				g.createdAt,
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
						<Users className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("guests.title")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("guests.subtitle")}
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
						<span>{t("guests.addGuest")}</span>
					</Button>
				</div>
			</div>

			{/* Filter Card (Separated) */}
			<Card className="rounded-2xl border bg-card">
				<CardContent className="p-4">
					<div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3">
						{/* Search Input */}
						<div className="flex-1 space-y-1.5">
							<Label variant="filter">{t("common.search")}</Label>
							<div className="relative">
								<Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
								<Input
									placeholder={t("guests.searchPlaceholder")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pe-9"
								/>
							</div>
						</div>

						{/* Order Direction */}
						<div className="w-full lg:w-40 space-y-1.5">
							<Label variant="filter">{t("guests.orderDirection")}</Label>
							<Select
								value={orderDirection}
								onValueChange={(val) =>
									setOrderDirection(val as "desc" | "asc")
								}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("guests.desc")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="desc">{t("guests.desc")}</SelectItem>
									<SelectItem value="asc">{t("guests.asc")}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Order By */}
						<div className="w-full lg:w-44 space-y-1.5">
							<Label variant="filter">{t("guests.orderBy")}</Label>
							<Select
								value={orderBy}
								onValueChange={(val) =>
									setOrderBy(val as "created_at" | "name" | "phone")
								}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("guests.creationDate")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="created_at">
										{t("guests.creationDate")}
									</SelectItem>
									<SelectItem value="name">{t("guests.name")}</SelectItem>
									<SelectItem value="phone">{t("guests.phone")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Table Card (Separated) */}
			<div className="rounded-2xl border bg-card overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40">
							<TableHead>{t("guests.name")}</TableHead>
							<TableHead>{t("guests.eventName")}</TableHead>
							<TableHead className="text-center">{t("guests.phone")}</TableHead>
							<TableHead>{t("guests.creationDate")}</TableHead>
							<TableHead className="w-30 text-end">
								{t("common.actions")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedAndFilteredGuests.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-24 text-center text-muted-foreground"
								>
									{t("common.noData")}
								</TableCell>
							</TableRow>
						) : (
							sortedAndFilteredGuests.map((guest) => {
								const firstLetter = guest.name
									? guest.name.trim().charAt(0)
									: "?";
								return (
									<TableRow
										key={guest.id}
										className="group hover:bg-muted/50 transition-colors cursor-pointer"
										onClick={() => setViewingGuest(guest)}
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar size="default">
													<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
														{firstLetter}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium text-sm text-foreground">
														{guest.name}
													</p>
													{guest.email && (
														<p className="text-xs text-muted-foreground">
															{guest.email}
														</p>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell className="font-medium text-sm text-foreground">
											{guest.eventName || guest.clientName || "-"}
										</TableCell>
										<TableCell
											className="text-center font-mono text-xs"
											dir="ltr"
										>
											{guest.phone}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatDate(guest.createdAt, i18n.language)}
										</TableCell>
										<TableCell
											className="text-end"
											onClick={(e) => e.stopPropagation()}
										>
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon-xs"
													onClick={() => setViewingGuest(guest)}
													title={t("guests.guestDetails")}
												>
													<Eye className="size-3.5 text-muted-foreground" />
												</Button>
												<Button
													variant="ghost"
													size="icon-xs"
													onClick={() => handleOpenEdit(guest)}
													title={t("guests.editGuest")}
												>
													<Edit2 className="size-3.5 text-muted-foreground" />
												</Button>
												<Button
													variant="ghost"
													size="icon-xs"
													onClick={() => handleDeletePrompt(guest)}
													title={t("guests.deleteGuest")}
												>
													<Trash2 className="size-3.5 text-rose-500" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Guest Details Dialog */}
			<Dialog
				open={!!viewingGuest}
				onOpenChange={(open) => !open && setViewingGuest(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<User className="size-5 text-primary" />
							{t("guests.guestDetails")}
						</DialogTitle>
					</DialogHeader>
					{viewingGuest && (
						<div className="space-y-4 py-2">
							<div className="flex items-center gap-4 bg-primary/5 rounded-xl p-4">
								<div className="size-14 rounded-full bg-primary/10 text-primary border-2 border-background shadow-xs flex items-center justify-center text-xl font-bold uppercase shrink-0">
									{viewingGuest.name.trim().charAt(0)}
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-base font-bold text-foreground truncate">
										{viewingGuest.name}
									</h3>
									<p className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">
										#{viewingGuest.id}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
								<div className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-lg p-3">
									<Phone className="size-4 text-muted-foreground shrink-0" />
									<div className="min-w-0">
										<p className="text-[10px] uppercase font-bold text-muted-foreground">
											{t("guests.phone")}
										</p>
										<p
											className="font-mono text-xs font-semibold truncate"
											dir="ltr"
										>
											{viewingGuest.phone}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-lg p-3">
									<Mail className="size-4 text-muted-foreground shrink-0" />
									<div className="min-w-0">
										<p className="text-[10px] uppercase font-bold text-muted-foreground">
											{t("guests.email")}
										</p>
										<p className="text-xs font-semibold truncate">
											{viewingGuest.email || "-"}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-lg p-3 sm:col-span-2">
									<Calendar className="size-4 text-muted-foreground shrink-0" />
									<div className="min-w-0">
										<p className="text-[10px] uppercase font-bold text-muted-foreground">
											{t("guests.eventName")}
										</p>
										<p className="text-sm font-semibold truncate">
											{viewingGuest.eventName || viewingGuest.clientName || "-"}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-lg p-3 sm:col-span-2">
									<Calendar className="size-4 text-muted-foreground shrink-0" />
									<div className="min-w-0">
										<p className="text-[10px] uppercase font-bold text-muted-foreground">
											{t("guests.creationDate")}
										</p>
										<p className="text-sm font-semibold truncate">
											{formatDate(viewingGuest.createdAt, i18n.language)}
										</p>
									</div>
								</div>
							</div>

							<DialogFooter className="pt-2">
								<Button variant="outline" onClick={() => setViewingGuest(null)}>
									{t("common.close")}
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Create / Edit Dialog */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingGuest ? t("guests.editGuest") : t("guests.addGuest")}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4 py-2">
						<div>
							<Label>{t("guests.name")}</Label>
							<Input
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="مثال: د. عبد الله الراجحي"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<Label>{t("guests.phone")}</Label>
								<Input
									required
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									placeholder="+966 50 000 0000"
									dir="ltr"
								/>
							</div>
							<div>
								<Label>{t("guests.email")}</Label>
								<Input
									type="email"
									value={formData.email || ""}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder="example@domain.com"
									dir="ltr"
								/>
							</div>
						</div>

						<div>
							<Label>{t("guests.eventName")}</Label>
							<Input
								required
								value={formData.eventName}
								onChange={(e) =>
									setFormData({
										...formData,
										eventName: e.target.value,
										clientName: e.target.value,
									})
								}
								placeholder="مثال: حفل زفاف سارة ومحمد"
							/>
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
				itemName={guestToDelete ? `${guestToDelete.name} (${guestToDelete.eventName})` : undefined}
			/>
		</div>
	);
}

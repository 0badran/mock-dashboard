import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";
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
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useMockCollection, type ClientItem } from "@/services/mockStorage";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function ClientsPage() {
	const { t, i18n } = useTranslation();
	const {
		data: clients,
		add,
		update,
		remove,
	} = useMockCollection<ClientItem>("clients");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [orderBy, setOrderBy] = useState<"all" | "name" | "date" | "guests">(
		"all",
	);
	const [orderDirection, setOrderDirection] = useState<"desc" | "asc">("desc");

	const [modalOpen, setModalOpen] = useState(false);
	const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [clientToDelete, setClientToDelete] = useState<ClientItem | null>(null);

	const [formData, setFormData] = useState<Omit<ClientItem, "id">>({
		name: "",
		email: "",
		phone: "",
		eventType: "حفل زفاف",
		eventDate: "2026-12-01",
		guestsCount: 100,
		status: "upcoming",
	});

	const filteredAndSortedClients = useMemo(() => {
		const result = clients.filter((c) => {
			const query = searchTerm.toLowerCase();
			const matchesSearch =
				c.name.toLowerCase().includes(query) ||
				c.email.toLowerCase().includes(query) ||
				c.phone.includes(query);
			const matchesStatus = statusFilter === "all" || c.status === statusFilter;
			return matchesSearch && matchesStatus;
		});

		if (orderBy !== "all") {
			result.sort((a, b) => {
				let comp: number;
				if (orderBy === "name") {
					comp = a.name.localeCompare(b.name, i18n.language);
				} else if (orderBy === "guests") {
					comp = a.guestsCount - b.guestsCount;
				} else {
					comp = a.eventDate.localeCompare(b.eventDate);
				}
				return orderDirection === "asc" ? comp : -comp;
			});
		}

		return result;
	}, [
		clients,
		searchTerm,
		statusFilter,
		orderBy,
		orderDirection,
		i18n.language,
	]);

	const handleOpenCreate = () => {
		setEditingClient(null);
		setFormData({
			name: "",
			email: "",
			phone: "+966 50 ",
			eventType: "حفل زفاف",
			eventDate: "2026-12-01",
			guestsCount: 150,
			status: "upcoming",
		});
		setModalOpen(true);
	};

	const handleOpenEdit = (client: ClientItem) => {
		setEditingClient(client);
		setFormData({
			name: client.name,
			email: client.email,
			phone: client.phone,
			eventType: client.eventType,
			eventDate: client.eventDate,
			guestsCount: client.guestsCount,
			status: client.status,
		});
		setModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name) {
			toast.error(t("clients.name"));
			return;
		}

		if (editingClient) {
			update(editingClient.id, formData);
			toast.success(t("common.itemUpdated"));
		} else {
			add(formData);
			toast.success(t("common.itemCreated"));
		}
		setModalOpen(false);
	};

	const handleDeletePrompt = (client: ClientItem) => {
		setClientToDelete(client);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!clientToDelete) return;
		remove(clientToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setClientToDelete(null);
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
							{t("clients.title")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("clients.subtitle")}
						</p>
					</div>
				</div>
				<Button onClick={handleOpenCreate} className="gap-1.5">
					<Plus className="size-4" />
					<span>{t("clients.addClient")}</span>
				</Button>
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
									placeholder={t("common.search")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pe-9"
								/>
							</div>
						</div>

						{/* Status Filter */}
						<div className="w-full lg:w-44 space-y-1.5">
							<Label variant="filter">{t("clients.status")}</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder={t("clients.allStatuses")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										{t("clients.allStatuses")}
									</SelectItem>
									<SelectItem value="active">{t("clients.active")}</SelectItem>
									<SelectItem value="completed">
										{t("clients.completed")}
									</SelectItem>
									<SelectItem value="upcoming">
										{t("clients.upcoming")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Order Direction */}
						<div className="w-full lg:w-36 space-y-1.5">
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
						<div className="w-full lg:w-40 space-y-1.5">
							<Label variant="filter">{t("guests.orderBy")}</Label>
							<Select
								value={orderBy}
								onValueChange={(val) =>
									setOrderBy(val as "all" | "name" | "date" | "guests")
								}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("clients.all")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("clients.all")}</SelectItem>
									<SelectItem value="name">{t("clients.name")}</SelectItem>
									<SelectItem value="date">{t("clients.joinDate")}</SelectItem>
									<SelectItem value="guests">{t("clients.guests")}</SelectItem>
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
							<TableHead>{t("clients.name")}</TableHead>
							<TableHead className="text-center">
								{t("clients.events")}
							</TableHead>
							<TableHead className="text-center">
								{t("clients.guests")}
							</TableHead>
							<TableHead className="text-center">
								{t("clients.status")}
							</TableHead>
							<TableHead>{t("clients.joinDate")}</TableHead>
							<TableHead className="w-25 text-end">
								{t("common.actions")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAndSortedClients.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center text-muted-foreground"
								>
									{t("common.noData")}
								</TableCell>
							</TableRow>
						) : (
							filteredAndSortedClients.map((client) => {
								const firstLetter = client.name
									? client.name.trim().charAt(0)
									: "?";
								return (
									<TableRow
										key={client.id}
										className="hover:bg-muted/50 transition-colors"
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar size="default">
													<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
														{firstLetter}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium text-sm text-foreground">
														{client.name}
													</div>
													<div className="text-xs text-muted-foreground mt-0.5">
														{client.email}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-center text-sm font-medium">
											1
										</TableCell>
										<TableCell className="text-center text-sm font-medium">
											{client.guestsCount}
										</TableCell>
										<TableCell className="text-center">
											<Badge
												variant={
													client.status === "active" ? "default" : "secondary"
												}
												className="text-xs"
											>
												{t(`clients.${client.status}`)}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatDate(client.eventDate, i18n.language)}
										</TableCell>
										<TableCell className="text-end">
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleOpenEdit(client)}
													title={t("clients.editClient")}
												>
													<Edit2 className="size-3.5 text-muted-foreground" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDeletePrompt(client)}
													title={t("common.delete")}
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

			{/* Create / Edit Dialog */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingClient ? t("clients.editClient") : t("clients.addClient")}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4 py-2">
						<div>
							<Label>{t("clients.name")}</Label>
							<Input
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="مثال: جهاد السالم"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<Label>{t("clients.email")}</Label>
								<Input
									type="email"
									required
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder="client@example.com"
									dir="ltr"
								/>
							</div>
							<div>
								<Label>{t("clients.phone")}</Label>
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
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<Label>{t("clients.eventType")}</Label>
								<Input
									value={formData.eventType}
									onChange={(e) =>
										setFormData({ ...formData, eventType: e.target.value })
									}
									placeholder="مثال: حفل زفاف"
								/>
							</div>
							<div>
								<Label>{t("clients.eventDate")}</Label>
								<Input
									type="date"
									value={formData.eventDate}
									onChange={(e) =>
										setFormData({ ...formData, eventDate: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<Label>{t("clients.guestsCount")}</Label>
								<Input
									type="number"
									min="1"
									value={formData.guestsCount}
									onChange={(e) =>
										setFormData({
											...formData,
											guestsCount: Number(e.target.value),
										})
									}
								/>
							</div>
							<div>
								<Label>{t("clients.status")}</Label>
								<Select
									value={formData.status}
									onValueChange={(val) =>
										setFormData({
											...formData,
											status: val as ClientItem["status"],
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="upcoming">
											{t("clients.upcoming")}
										</SelectItem>
										<SelectItem value="active">
											{t("clients.active")}
										</SelectItem>
										<SelectItem value="completed">
											{t("clients.completed")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter className="gap-3 sm:gap-3 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setModalOpen(false)}
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

			<ConfirmDialog
				open={deleteConfirmOpen}
				onOpenChange={setDeleteConfirmOpen}
				onConfirm={handleConfirmDelete}
				itemName={
					clientToDelete
						? `${clientToDelete.name} (${clientToDelete.eventType})`
						: undefined
				}
			/>
		</div>
	);
}

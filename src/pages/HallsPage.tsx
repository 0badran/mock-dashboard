import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	Building2,
	Plus,
	Search,
	MapPin,
	Users,
	LayoutDashboard,
	Edit2,
	Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { useMockCollection, type HallItem } from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function HallsPage() {
	const { t } = useTranslation();
	const {
		data: halls,
		add,
		update,
		remove,
	} = useMockCollection<HallItem>("halls");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingHall, setEditingHall] = useState<HallItem | null>(null);
	const [layoutModalOpen, setLayoutModalOpen] = useState(false);
	const [selectedHallForLayout, setSelectedHallForLayout] =
		useState<HallItem | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [hallToDelete, setHallToDelete] = useState<HallItem | null>(null);

	const getHallStatusLabel = (status: HallItem["status"]) => {
		switch (status) {
			case "available":
				return t("halls.available");
			case "maintenance":
				return t("halls.maintenance");
			case "unavailable":
				return t("halls.unavailable");
		}
	};

	const [formData, setFormData] = useState<Omit<HallItem, "id">>({
		name: "",
		address: "",
		capacity: 300,
		tablesCount: 30,
		seatsCount: 300,
		displayOrder: 1,
		status: "available",
		imageUrl: "",
	});

	const filteredHalls = useMemo(() => {
		return halls.filter((hall) => {
			const query = searchTerm.toLowerCase();
			const matchesSearch =
				hall.name.toLowerCase().includes(query) ||
				hall.address.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === "all" || hall.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [halls, searchTerm, statusFilter]);

	const handleOpenCreate = () => {
		setEditingHall(null);
		setFormData({
			name: "",
			address: "",
			capacity: 350,
			tablesCount: 35,
			seatsCount: 350,
			displayOrder: halls.length + 1,
			status: "available",
			imageUrl:
				"https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop",
		});
		setModalOpen(true);
	};

	const handleOpenEdit = (hall: HallItem) => {
		setEditingHall(hall);
		setFormData({
			name: hall.name,
			address: hall.address,
			capacity: hall.capacity,
			tablesCount: hall.tablesCount,
			seatsCount: hall.seatsCount,
			displayOrder: hall.displayOrder,
			status: hall.status,
			imageUrl: hall.imageUrl || "",
		});
		setModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) return;

		if (editingHall) {
			update(editingHall.id, formData);
			toast.success(t("common.itemUpdated"));
		} else {
			add(formData);
			toast.success(t("common.itemCreated"));
		}
		setModalOpen(false);
	};

	const handleDeletePrompt = (hall: HallItem) => {
		setHallToDelete(hall);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!hallToDelete) return;
		remove(hallToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setHallToDelete(null);
	};

	const handleOpenLayout = (hall: HallItem) => {
		setSelectedHallForLayout(hall);
		setLayoutModalOpen(true);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<Building2 className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("sidebar.halls")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("halls.manageHallsDescription")}
						</p>
					</div>
				</div>

				<Button onClick={handleOpenCreate} className="gap-2">
					<Plus className="size-4" />
					<span>{t("halls.addHall")}</span>
				</Button>
			</div>

			{/* Filter Card */}
			<Card className="rounded-2xl border bg-card">
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
						<div className="flex-1 space-y-1.5">
							<Label variant="filter">{t("common.search")}</Label>
							<div className="relative">
								<Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
								<Input
									placeholder={t("halls.searchPlaceholder")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pe-9"
								/>
							</div>
						</div>

						<div className="w-full sm:w-48 space-y-1.5">
							<Label variant="filter">{t("common.status")}</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder={t("common.all")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("common.all")}</SelectItem>
									<SelectItem value="available">
										{t("halls.available")}
									</SelectItem>
									<SelectItem value="maintenance">
										{t("halls.maintenance")}
									</SelectItem>
									<SelectItem value="unavailable">
										{t("halls.unavailable")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Halls Grid */}
			{filteredHalls.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 rounded-2xl border border-dashed bg-card">
					<Building2 className="size-12 opacity-30 text-primary" />
					<p className="text-sm font-semibold">{t("halls.noHallsFound")}</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<AnimatePresence mode="popLayout">
						{filteredHalls.map((hall, index) => (
							<motion.div
								key={hall.id}
								layout
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: 0.03 * index, duration: 0.25 }}
								className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
							>
								{/* Image Banner */}
								<div className="relative h-52 w-full overflow-hidden bg-muted">
									{hall.imageUrl ? (
										<img
											src={hall.imageUrl}
											alt={hall.name}
											className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
										/>
									) : (
										<div className="size-full flex items-center justify-center bg-muted/60 text-muted-foreground">
											<Building2 className="size-14 opacity-30" />
										</div>
									)}

									{/* Status Badge */}
									<div className="absolute top-3 inset-s-3">
										<Badge
											variant={
												hall.status === "available"
													? "success"
													: hall.status === "maintenance"
														? "warning"
														: "destructive"
											}
											className="shadow-sm font-semibold"
										>
											{getHallStatusLabel(hall.status)}
										</Badge>
									</div>

									<div className="absolute top-3 inset-e-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-xs font-mono font-bold">
										#{hall.displayOrder}
									</div>
								</div>

								{/* Details */}
								<div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
									<div className="space-y-1.5">
										<h3 className="font-bold text-base text-foreground leading-tight line-clamp-1">
											{hall.name}
										</h3>
										{hall.address && (
											<p className="flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
												<MapPin className="size-3.5 shrink-0 text-primary" />
												<span>{hall.address}</span>
											</p>
										)}
									</div>

									{/* Stats Row */}
									<div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2 border-t border-border/50">
										<div className="flex items-center gap-1.5">
											<LayoutDashboard className="size-3.5 text-primary" />
											<span>
												{hall.tablesCount} {t("halls.tables")}
											</span>
										</div>
										<div className="flex items-center gap-1.5">
											<Users className="size-3.5 text-primary" />
											<span>
												{hall.seatsCount}+ {t("halls.seats")}
											</span>
										</div>
									</div>

									{/* Bottom Actions */}
									<div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
										<Button
											variant="outline"
											size="xs"
											onClick={() => handleOpenLayout(hall)}
											className="gap-1.5 text-xs text-primary hover:bg-primary/10"
										>
											<LayoutDashboard className="size-3.5" />
											<span>{t("halls.manageLayout")}</span>
										</Button>

										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => handleOpenEdit(hall)}
												title={t("common.edit")}
											>
												<Edit2 className="size-3.5 text-muted-foreground" />
											</Button>
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => handleDeletePrompt(hall)}
												title={t("common.delete")}
											>
												<Trash2 className="size-3.5 text-rose-500" />
											</Button>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}

			{/* Create / Edit Dialog */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Building2 className="size-5 text-primary" />
							{editingHall ? t("halls.editHall") : t("halls.addHall")}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4 py-2">
						<div>
							<Label>{t("halls.hallName")}</Label>
							<Input
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder={t("halls.hallName")}
							/>
						</div>

						<div>
							<Label>{t("halls.address")}</Label>
							<Input
								required
								value={formData.address}
								onChange={(e) =>
									setFormData({ ...formData, address: e.target.value })
								}
								placeholder={t("halls.address")}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>{t("halls.tablesCount")}</Label>
								<Input
									type="number"
									min="1"
									value={formData.tablesCount}
									onChange={(e) =>
										setFormData({
											...formData,
											tablesCount: Number(e.target.value),
										})
									}
								/>
							</div>
							<div>
								<Label>{t("halls.seatsCount")}</Label>
								<Input
									type="number"
									min="1"
									value={formData.seatsCount}
									onChange={(e) =>
										setFormData({
											...formData,
											seatsCount: Number(e.target.value),
										})
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>{t("common.status")}</Label>
								<Select
									value={formData.status}
									onValueChange={(val) =>
										setFormData({
											...formData,
											status: val as HallItem["status"],
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="available">
											{t("halls.available")}
										</SelectItem>
										<SelectItem value="maintenance">
											{t("halls.maintenance")}
										</SelectItem>
										<SelectItem value="unavailable">
											{t("halls.unavailable")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>{t("halls.displayOrder")}</Label>
								<Input
									type="number"
									min="1"
									value={formData.displayOrder}
									onChange={(e) =>
										setFormData({
											...formData,
											displayOrder: Number(e.target.value),
										})
									}
								/>
							</div>
						</div>

						<div>
							<Label>{t("halls.imageUrl")}</Label>
							<Input
								value={formData.imageUrl}
								onChange={(e) =>
									setFormData({ ...formData, imageUrl: e.target.value })
								}
								placeholder="https://images.unsplash.com/..."
							/>
						</div>

						<DialogFooter className="gap-3 sm:gap-3 pt-2">
							<Button
								type="button"
								variant="outline"
								size="lg"
								onClick={() => setModalOpen(false)}
							>
								{t("common.cancel")}
							</Button>
							<Button size="lg" type="submit">
								{t("common.save")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Hall Layout Preview Modal */}
			<Dialog open={layoutModalOpen} onOpenChange={setLayoutModalOpen}>
				<DialogContent className="sm:max-w-xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<LayoutDashboard className="size-5 text-primary" />
							<span>
								{t("halls.layoutOf")} {selectedHallForLayout?.name}
							</span>
						</DialogTitle>
					</DialogHeader>
					{selectedHallForLayout && (
						<div className="space-y-4 py-2">
							<div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between text-xs text-muted-foreground font-medium">
								<span>
									{t("halls.totalTables")}:{" "}
									<strong className="text-foreground">
										{selectedHallForLayout.tablesCount}
									</strong>
								</span>
								<span>
									{t("halls.totalCapacity")}:{" "}
									<strong className="text-foreground">
										{selectedHallForLayout.seatsCount} {t("halls.seats")}
									</strong>
								</span>
								<span>
									{t("common.status")}:{" "}
									<Badge
										variant={
											selectedHallForLayout.status === "available"
												? "success"
												: "warning"
										}
										className="text-[10px]"
									>
										{getHallStatusLabel(selectedHallForLayout.status)}
									</Badge>
								</span>
							</div>

							{/* Interactive Hall Layout Canvas Mock */}
							<div className="relative border-2 border-dashed border-primary/20 rounded-2xl p-6 bg-header min-h-64 flex flex-col items-center justify-between overflow-hidden">
								{/* Stage */}
								<div className="w-1/2 h-8 bg-primary/20 border border-primary/40 rounded-lg flex items-center justify-center text-xs font-bold text-primary tracking-widest uppercase">
									{t("halls.mainStage")}
								</div>

								{/* Mock Tables Layout Grid */}
								<div className="grid grid-cols-4 sm:grid-cols-6 gap-3 w-full my-6">
									{Array.from({
										length: Math.min(
											18,
											selectedHallForLayout.tablesCount || 12,
										),
									}).map((_, i) => (
										<div
											key={i}
											className="size-12 rounded-full border-2 border-primary/30 bg-card shadow-xs flex flex-col items-center justify-center hover:border-primary hover:scale-105 transition-transform cursor-pointer group"
											title={`Table T-${i + 1}`}
										>
											<span className="text-[10px] font-bold text-foreground">
												T-{i + 1}
											</span>
											<span className="text-[8px] text-muted-foreground">
												{Math.round(
													selectedHallForLayout.seatsCount /
														selectedHallForLayout.tablesCount,
												) || 8}
												s
											</span>
										</div>
									))}
								</div>

								{/* Entrance */}
								<div className="w-1/3 h-6 bg-muted border border-border rounded-md flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
									{t("halls.entrance")}
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							size="lg"
							onClick={() => setLayoutModalOpen(false)}
						>
							{t("common.close")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={deleteConfirmOpen}
				onOpenChange={setDeleteConfirmOpen}
				onConfirm={handleConfirmDelete}
				itemName={hallToDelete ? hallToDelete.name : undefined}
			/>
		</div>
	);
}

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	LayoutGrid,
	Search,
	Building2,
	Calendar,
	UserPlus,
	X,
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
import {
	useMockCollection,
	type EventLayoutItem,
	type HallItem,
} from "@/services/mockStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MockTableGuest {
	tableId: number;
	tableName: string;
	capacity: number;
	isVip?: boolean;
	guests: string[];
}

export default function HallLayoutsPage() {
	const { t } = useTranslation();
	const {
		data: layouts,
		update,
	} = useMockCollection<EventLayoutItem>("eventLayouts");
	const { data: halls } = useMockCollection<HallItem>("halls");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [hallFilter, setHallFilter] = useState<string>("all");

	// Active Seating Modal
	const [selectedLayout, setSelectedLayout] = useState<EventLayoutItem | null>(
		null,
	);
	const [selectedTable, setSelectedTable] = useState<MockTableGuest | null>(null);
	const [newGuestName, setNewGuestName] = useState("");

	// Mock table seating structure for modal visualizer
	const [tablesState, setTablesState] = useState<MockTableGuest[]>([
		{
			tableId: 1,
			tableName: "VIP-1",
			capacity: 10,
			isVip: true,
			guests: ["سعادة الوزير م. عبدالله", "د. فهد السليمان", "أ. نورة الشريف"],
		},
		{
			tableId: 2,
			tableName: "VIP-2",
			capacity: 10,
			isVip: true,
			guests: ["الشيخ عبدالعزيز آل الشيخ", "م. سلطان القحطاني"],
		},
		{
			tableId: 3,
			tableName: "T-3",
			capacity: 8,
			guests: ["عمر الحربي", "زياد الماجد", "سعد الهاجري", "راكان العلي"],
		},
		{
			tableId: 4,
			tableName: "T-4",
			capacity: 8,
			guests: ["منى العماري", "ريم الشهري", "لمى الدوسري"],
		},
		{
			tableId: 5,
			tableName: "T-5",
			capacity: 8,
			guests: ["فيصل الدخيل", "سامي الصالح", "ماجد الخالد", "وليد العنزي"],
		},
		{
			tableId: 6,
			tableName: "T-6",
			capacity: 8,
			guests: ["دلال المطيري", "فاطمة الزهراني"],
		},
	]);

	// Filtered layouts
	const filteredLayouts = useMemo(() => {
		return layouts.filter((lay) => {
			const query = searchTerm.toLowerCase();
			const matchSearch =
				lay.eventName.toLowerCase().includes(query) ||
				lay.clientName.toLowerCase().includes(query) ||
				lay.hallName.toLowerCase().includes(query);
			const matchStatus =
				statusFilter === "all" ||
				(statusFilter === "configured" && lay.hasLayout) ||
				(statusFilter === "pending" && !lay.hasLayout);
			const matchHall = hallFilter === "all" || lay.hallName === hallFilter;
			return matchSearch && matchStatus && matchHall;
		});
	}, [layouts, searchTerm, statusFilter, hallFilter]);

	// Stats
	const totalEvents = layouts.length;
	const configuredCount = layouts.filter((l) => l.hasLayout).length;
	const pendingCount = layouts.filter((l) => !l.hasLayout).length;
	const totalSeated = layouts.reduce((sum, l) => sum + l.seatedGuests, 0);

	const handleOpenLayoutModal = (layout: EventLayoutItem) => {
		setSelectedLayout(layout);
		setSelectedTable(tablesState[0] || null);
	};

	const handleAddGuestToTable = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedTable || !newGuestName.trim() || !selectedLayout) return;

		const updatedTables = tablesState.map((t) => {
			if (t.tableId === selectedTable.tableId) {
				return {
					...t,
					guests: [...t.guests, newGuestName.trim()],
				};
			}
			return t;
		});

		setTablesState(updatedTables);
		setSelectedTable({
			...selectedTable,
			guests: [...selectedTable.guests, newGuestName.trim()],
		});
		setNewGuestName("");

		// Increment seated count on layout
		update(selectedLayout.id, {
			seatedGuests: Math.min(
				selectedLayout.totalGuests,
				selectedLayout.seatedGuests + 1,
			),
			hasLayout: true,
		});

		toast.success(t("hallLayouts.saveLayoutSuccess"));
	};

	const handleRemoveGuestFromTable = (guestName: string) => {
		if (!selectedTable || !selectedLayout) return;

		const updatedTables = tablesState.map((t) => {
			if (t.tableId === selectedTable.tableId) {
				return {
					...t,
					guests: t.guests.filter((g) => g !== guestName),
				};
			}
			return t;
		});

		setTablesState(updatedTables);
		setSelectedTable({
			...selectedTable,
			guests: selectedTable.guests.filter((g) => g !== guestName),
		});

		update(selectedLayout.id, {
			seatedGuests: Math.max(0, selectedLayout.seatedGuests - 1),
		});
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<LayoutGrid className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("sidebar.hall_layouts")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("hallLayouts.description")}
						</p>
					</div>
				</div>
			</div>

			{/* KPI Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-primary" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("hallLayouts.totalLayouts")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{totalEvents}
					</h3>
				</div>
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-success" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("hallLayouts.configuredLayouts")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{configuredCount}
					</h3>
				</div>
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-warning" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("hallLayouts.pendingLayouts")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{pendingCount}
					</h3>
				</div>
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-info" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("hallLayouts.totalSeated")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{totalSeated}
					</h3>
				</div>
			</div>

			{/* Filters */}
			<Card className="rounded-2xl border bg-card">
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
						<div className="flex-1 space-y-1.5">
							<Label variant="filter">{t("common.search")}</Label>
							<div className="relative">
								<Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
								<Input
									placeholder={t("hallLayouts.searchPlaceholder")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pe-9"
								/>
							</div>
						</div>

						<div className="w-full sm:w-44 space-y-1.5">
							<Label variant="filter">{t("common.status")}</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder={t("common.all")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("common.all")}</SelectItem>
									<SelectItem value="configured">
										{t("hallLayouts.hasLayout")}
									</SelectItem>
									<SelectItem value="pending">
										{t("hallLayouts.noLayout")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="w-full sm:w-48 space-y-1.5">
							<Label variant="filter">{t("halls.title")}</Label>
							<Select value={hallFilter} onValueChange={setHallFilter}>
								<SelectTrigger>
									<SelectValue placeholder={t("common.all")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("common.all")}</SelectItem>
									{halls.map((h) => (
										<SelectItem key={h.id} value={h.name}>
											{h.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Layouts Grid */}
			{filteredLayouts.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 rounded-2xl border border-dashed bg-card">
					<LayoutGrid className="size-12 opacity-30 text-primary" />
					<p className="text-sm font-semibold">
						{t("hallLayouts.noLayoutsFound")}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<AnimatePresence mode="popLayout">
						{filteredLayouts.map((lay, index) => {
							const percentage =
								lay.totalGuests > 0
									? Math.round((lay.seatedGuests / lay.totalGuests) * 100)
									: 0;

							return (
								<motion.div
									key={lay.id}
									layout
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ delay: 0.03 * index, duration: 0.25 }}
									className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between space-y-4"
								>
									{/* Top Header */}
									<div className="flex items-start justify-between gap-3">
										<div className="space-y-1 min-w-0">
											<h3 className="font-bold text-base text-foreground leading-tight truncate">
												{lay.eventName}
											</h3>
											<p className="text-xs text-muted-foreground">
												{lay.clientName}
											</p>
										</div>
										<Badge
											variant={lay.hasLayout ? "success" : "secondary"}
											className="shrink-0 text-xs font-semibold"
										>
											{lay.hasLayout
												? t("hallLayouts.hasLayout")
												: t("hallLayouts.noLayout")}
										</Badge>
									</div>

									{/* Venue & Date Info */}
									<div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
										<div className="flex items-center gap-2">
											<Building2 className="size-3.5 text-primary shrink-0" />
											<span className="truncate">{lay.hallName}</span>
										</div>
										<div className="flex items-center gap-2">
											<Calendar className="size-3.5 text-primary shrink-0" />
											<span className="font-mono">{lay.eventDate}</span>
										</div>
									</div>

									{/* Seating Progress */}
									<div className="space-y-1.5 pt-2 border-t border-border/50">
										<div className="flex justify-between items-center text-xs">
											<span className="font-medium text-foreground">
												{t("hallLayouts.seatedProgress")}
											</span>
											<span className="font-bold font-mono text-primary">
												{percentage}%
											</span>
										</div>
										<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
											<div
												className="h-full bg-primary rounded-full transition-all duration-300"
												style={{ width: `${percentage}%` }}
											/>
										</div>
										<div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
											<span>
												{lay.seatedGuests} / {lay.totalGuests} مسكن
											</span>
											<span>
												{lay.tablesCount} {t("hallLayouts.table")}
											</span>
										</div>
									</div>

									{/* Bottom Action */}
									<div className="pt-2 border-t border-border/50">
										<Button
											variant="outline"
											className="w-full gap-2 text-xs font-bold"
											onClick={() => handleOpenLayoutModal(lay)}
										>
											<LayoutGrid className="size-3.5" />
											<span>{t("hallLayouts.manageSeating")}</span>
										</Button>
									</div>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			)}

			{/* Interactive Seating Chart & Guest Assigner Dialog */}
			<Dialog
				open={!!selectedLayout}
				onOpenChange={(open) => !open && setSelectedLayout(null)}
			>
				<DialogContent className="sm:max-w-4xl p-6">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<LayoutGrid className="size-5 text-primary" />
							<span>
								{t("hallLayouts.seatingChart")} — {selectedLayout?.eventName}
							</span>
						</DialogTitle>
					</DialogHeader>

					{selectedLayout && (
						<div className="space-y-5 py-2">
							{/* Overview bar */}
							<div className="p-3.5 bg-muted/40 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
								<div className="flex items-center gap-2">
									<Building2 className="size-4 text-primary" />
									<span className="font-bold text-foreground">
										{selectedLayout.hallName}
									</span>
								</div>
								<div className="flex items-center gap-4">
									<span>
										{t("hallLayouts.totalSeated")}:{" "}
										<strong className="text-primary font-mono text-sm">
											{selectedLayout.seatedGuests} / {selectedLayout.totalGuests}
										</strong>
									</span>
									<Badge variant="outline" className="font-mono">
										{selectedLayout.tablesCount} {t("hallLayouts.table")}
									</Badge>
								</div>
							</div>

							{/* Main Visual Seating Layout & Inspector */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
								{/* Floor Plan View */}
								<div className="md:col-span-2 relative border-2 border-dashed border-primary/20 rounded-3xl p-5 bg-header flex flex-col items-center justify-between min-h-95 overflow-hidden">
									{/* Kosha / Stage */}
									<div className="w-3/5 h-8 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center text-xs font-bold text-primary tracking-widest uppercase">
										{t("hallLayouts.stage")}
									</div>

									{/* Tables Grid Layout */}
									<div className="grid grid-cols-3 gap-4 w-full my-6">
										{tablesState.map((table) => {
											const isSelected =
												selectedTable?.tableId === table.tableId;
											const isFull = table.guests.length >= table.capacity;

											return (
												<div
													key={table.tableId}
													onClick={() => setSelectedTable(table)}
													className={cn(
														"p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-28 relative group",
														isSelected
															? "border-primary bg-primary/10 shadow-md scale-102"
															: table.isVip
																? "border-amber-400 bg-amber-500/5 hover:border-amber-500"
																: "border-border bg-card hover:border-primary/40",
													)}
												>
													<div className="flex items-center justify-between">
														<span className="font-bold text-xs text-foreground font-mono">
															{table.tableName}
														</span>
														{table.isVip && (
															<Badge
																variant="outline"
																className="text-[9px] px-1 py-0 text-amber-600 border-amber-300"
															>
																VIP
															</Badge>
														)}
													</div>

													{/* Guests count */}
													<div className="text-center my-1">
														<span className="text-lg font-black text-foreground tabular-nums">
															{table.guests.length}
														</span>
														<span className="text-[10px] text-muted-foreground">
															/{table.capacity}
														</span>
													</div>

													<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
														<div
															className={cn(
																"h-full rounded-full transition-all",
																isFull
																	? "bg-rose-500"
																	: table.isVip
																		? "bg-amber-500"
																		: "bg-primary",
															)}
															style={{
																width: `${Math.min(100, (table.guests.length / table.capacity) * 100)}%`,
															}}
														/>
													</div>
												</div>
											);
										})}
									</div>

									{/* Entrance */}
									<div className="w-1/3 h-6 bg-muted border border-border rounded-md flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
										{t("halls.entrance")}
									</div>
								</div>

								{/* Selected Table Inspector & Guest Assign */}
								<div className="bg-card border border-border/50 rounded-3xl p-4 shadow-xs space-y-4">
									{selectedTable ? (
										<>
											<div className="flex items-center justify-between border-b pb-3">
												<div>
													<h4 className="font-bold text-sm text-foreground">
														{selectedTable.tableName}
													</h4>
													<p className="text-xs text-muted-foreground">
														السعة: {selectedTable.capacity} مقاعد
													</p>
												</div>
												<Badge
													variant={selectedTable.isVip ? "warning" : "outline"}
													className="text-xs"
												>
													{selectedTable.guests.length} / {selectedTable.capacity}
												</Badge>
											</div>

											{/* Add guest to this table */}
											<form
												onSubmit={handleAddGuestToTable}
												className="space-y-2"
											>
												<Label className="text-xs">
													إضافة ضيف لهذه الطاولة
												</Label>
												<div className="flex gap-2">
													<Input
														value={newGuestName}
														onChange={(e) => setNewGuestName(e.target.value)}
														placeholder="اسم الضيف..."
														className="h-8 text-xs rounded-xl"
													/>
													<Button
														type="submit"
														size="sm"
														className="rounded-xl shrink-0"
													>
														<UserPlus className="size-3.5" />
													</Button>
												</div>
											</form>

											{/* Seated guests list */}
											<div className="space-y-1.5">
												<Label className="text-xs text-muted-foreground">
													{t("hallLayouts.viewGuests")}:
												</Label>
												<div className="space-y-1.5 max-h-48 overflow-y-auto pe-1">
													{selectedTable.guests.length === 0 ? (
														<p className="text-xs text-muted-foreground text-center py-4">
															لا يوجد ضيوف مسكنين على هذه الطاولة بعد
														</p>
													) : (
														selectedTable.guests.map((name, i) => (
															<div
																key={i}
																className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs text-foreground group"
															>
																<span className="font-medium truncate">
																	{name}
																</span>
																<Button
																	variant="ghost"
																	size="icon-xs"
																	onClick={() =>
																		handleRemoveGuestFromTable(name)
																	}
																	className="opacity-0 group-hover:opacity-100 text-rose-500"
																>
																	<X className="size-3" />
																</Button>
															</div>
														))
													)}
												</div>
											</div>
										</>
									) : (
										<div className="text-center py-12 text-xs text-muted-foreground">
											اضغط على أي طاولة في المخطط لعرض وتسكين الضيوف
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							size="lg"
							onClick={() => setSelectedLayout(null)}
						>
							{t("common.close")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

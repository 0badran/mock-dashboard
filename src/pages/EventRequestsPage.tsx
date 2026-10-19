import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	CalendarClock,
	Plus,
	Search,
	Check,
	X,
	Eye,
	Trash2,
	AlertCircle,
	Users,
	Clock,
	Building2,
	FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	useMockCollection,
	type EventRequestItem,
	type HallItem,
} from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function EventRequestsPage() {
	const { t } = useTranslation();
	const {
		data: requests,
		add,
		update,
		remove,
	} = useMockCollection<EventRequestItem>("eventRequests");
	const { data: halls } = useMockCollection<HallItem>("halls");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [hallFilter, setHallFilter] = useState<string>("all");

	// Modals
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [viewingRequest, setViewingRequest] = useState<EventRequestItem | null>(
		null,
	);
	const [rejectingRequest, setRejectingRequest] =
		useState<EventRequestItem | null>(null);
	const [rejectionReasonText, setRejectionReasonText] = useState("");
	const [activeRejectionView, setActiveRejectionView] = useState<string | null>(
		null,
	);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [requestToDelete, setRequestToDelete] = useState<EventRequestItem | null>(null);
	const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
	const [requestToApprove, setRequestToApprove] = useState<EventRequestItem | null>(null);

	const [formData, setFormData] = useState({
		name: "",
		clientName: "",
		clientPhone: "",
		hallName: "",
		eventTypeName: "حفل زفاف",
		startsAt: "",
		endsAt: "",
		guestCount: 200,
		notes: "",
	});

	// Filtered requests
	const filteredRequests = useMemo(() => {
		return requests.filter((req) => {
			const query = searchTerm.toLowerCase();
			const matchSearch =
				req.name.toLowerCase().includes(query) ||
				req.clientName.toLowerCase().includes(query) ||
				req.clientPhone.toLowerCase().includes(query) ||
				req.hallName.toLowerCase().includes(query);
			const matchStatus =
				statusFilter === "all" || req.status === statusFilter;
			const matchHall = hallFilter === "all" || req.hallName === hallFilter;
			return matchSearch && matchStatus && matchHall;
		});
	}, [requests, searchTerm, statusFilter, hallFilter]);

	// Counts
	const totalCount = requests.length;
	const pendingCount = requests.filter((r) => r.status === "pending").length;
	const approvedCount = requests.filter((r) => r.status === "approved").length;
	const rejectedCount = requests.filter((r) => r.status === "rejected").length;

	const handleOpenCreate = () => {
		setFormData({
			name: "",
			clientName: "",
			clientPhone: "",
			hallName: halls[0]?.name || "قاعة لونا الملكية",
			eventTypeName: "حفل زفاف",
			startsAt: `${new Date().toISOString().split("T")[0]} 19:00`,
			endsAt: `${new Date().toISOString().split("T")[0]} 23:30`,
			guestCount: 200,
			notes: "",
		});
		setCreateModalOpen(true);
	};

	const handleCreateSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim() || !formData.clientName.trim()) return;

		add({
			name: formData.name,
			clientName: formData.clientName,
			clientPhone: formData.clientPhone,
			hallName: formData.hallName,
			eventTypeName: formData.eventTypeName,
			startsAt: formData.startsAt,
			endsAt: formData.endsAt,
			guestCount: Number(formData.guestCount) || 100,
			status: "pending",
			notes: formData.notes,
			createdAt: new Date().toISOString().split("T")[0],
		});

		toast.success(t("common.itemCreated"));
		setCreateModalOpen(false);
	};

	const handleApprovePrompt = (req: EventRequestItem) => {
		setRequestToApprove(req);
		setApproveConfirmOpen(true);
	};

	const handleConfirmApprove = () => {
		if (!requestToApprove) return;
		update(requestToApprove.id, {
			status: "approved",
			rejectionReason: undefined,
		});
		toast.success(t("eventRequests.approvedSuccess"));
		setApproveConfirmOpen(false);
		setRequestToApprove(null);
	};

	const handleOpenReject = (req: EventRequestItem) => {
		setRejectingRequest(req);
		setRejectionReasonText("");
	};

	const handleConfirmReject = (e: React.FormEvent) => {
		e.preventDefault();
		if (!rejectingRequest) return;

		update(rejectingRequest.id, {
			status: "rejected",
			rejectionReason:
				rejectionReasonText.trim() ||
				"لم يتم استيفاء شروط الحجز أو تعذر توافر الموعد المطلوب.",
		});

		toast.error(t("eventRequests.rejectedSuccess"));
		setRejectingRequest(null);
	};

	const handleDeletePrompt = (req: EventRequestItem) => {
		setRequestToDelete(req);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!requestToDelete) return;
		remove(requestToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setRequestToDelete(null);
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<CalendarClock className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("sidebar.events_requests")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("eventRequests.description")}
						</p>
					</div>
				</div>

				<Button onClick={handleOpenCreate} className="gap-2">
					<Plus className="size-4" />
					<span>{t("eventRequests.newRequest")}</span>
				</Button>
			</div>

			{/* KPI Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-primary" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("eventRequests.totalRequests")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{totalCount}
					</h3>
				</div>
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-warning" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("eventRequests.pending")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{pendingCount}
					</h3>
				</div>
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-success" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("eventRequests.approved")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{approvedCount}
					</h3>
				</div>
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 ps-5 shadow-xs flex flex-col justify-between">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-destructive" />
					<p className="text-xs font-medium text-muted-foreground">
						{t("eventRequests.rejected")}
					</p>
					<h3 className="text-2xl font-black mt-2 text-foreground">
						{rejectedCount}
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
									placeholder={t("eventRequests.searchPlaceholder")}
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
									<SelectItem value="pending">
										{t("eventRequests.pending")}
									</SelectItem>
									<SelectItem value="approved">
										{t("eventRequests.approved")}
									</SelectItem>
									<SelectItem value="rejected">
										{t("eventRequests.rejected")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="w-full sm:w-48 space-y-1.5">
							<Label variant="filter">{t("eventRequests.hall")}</Label>
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

			{/* Requests Table */}
			<div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-muted/50">
							<TableRow>
								<TableHead className="text-start">
									{t("eventRequests.client")}
								</TableHead>
								<TableHead className="text-start">
									{t("eventRequests.eventName")}
								</TableHead>
								<TableHead className="text-start">
									{t("eventRequests.hall")}
								</TableHead>
								<TableHead className="text-start">
									{t("eventRequests.eventType")}
								</TableHead>
								<TableHead className="whitespace-nowrap text-start">
									{t("eventRequests.startsAt")}
								</TableHead>
								<TableHead className="text-center">
									{t("eventRequests.guests")}
								</TableHead>
								<TableHead className="text-start">
									{t("eventRequests.status")}
								</TableHead>
								<TableHead className="text-center">
									{t("eventRequests.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredRequests.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="h-44 text-center">
										<div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
											<CalendarClock className="size-10 opacity-30 text-primary" />
											<p className="text-sm font-semibold">
												{t("eventRequests.noRequestsFound")}
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								filteredRequests.map((req) => (
									<TableRow key={req.id} className="hover:bg-muted/40">
										<TableCell className="max-w-42.5">
											<div className="min-w-0">
												<span className="block truncate font-bold text-foreground">
													{req.clientName}
												</span>
												<span
													className="block truncate text-xs text-muted-foreground font-mono"
													dir="ltr"
												>
													{req.clientPhone}
												</span>
											</div>
										</TableCell>

										<TableCell className="max-w-47.5">
											<span className="block truncate font-semibold text-foreground">
												{req.name}
											</span>
										</TableCell>

										<TableCell className="max-w-37.5">
											<span className="block truncate text-muted-foreground text-xs font-medium">
												{req.hallName}
											</span>
										</TableCell>

										<TableCell className="max-w-32.5">
											<Badge variant="outline" className="text-xs">
												{req.eventTypeName}
											</Badge>
										</TableCell>

										<TableCell className="whitespace-nowrap text-xs text-muted-foreground font-mono">
											{req.startsAt}
										</TableCell>

										<TableCell className="text-center">
											<span className="inline-flex min-w-8 justify-center rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
												{req.guestCount}
											</span>
										</TableCell>

										<TableCell>
											<div className="flex items-center gap-1.5">
												<Badge
													variant={
														req.status === "approved"
															? "success"
															: req.status === "rejected"
																? "destructive"
																: "warning"
													}
													className="text-xs font-semibold"
												>
													{t(`eventRequests.${req.status}`)}
												</Badge>
												{req.rejectionReason && (
													<Button
														variant="ghost"
														size="icon-xs"
														onClick={() =>
															setActiveRejectionView(req.rejectionReason || "")
														}
														title={t("eventRequests.rejectionReason")}
													>
														<AlertCircle className="size-3.5 text-destructive" />
													</Button>
												)}
											</div>
										</TableCell>

										<TableCell>
											<div className="flex items-center justify-center gap-1">
												<Button
													size="icon-xs"
													variant="ghost"
													onClick={() => setViewingRequest(req)}
													title={t("eventRequests.details")}
												>
													<Eye className="size-3.5 text-primary" />
												</Button>

												{req.status === "pending" && (
													<>
														<Button
															size="icon-xs"
															variant="ghost"
															onClick={() => handleApprovePrompt(req)}
															title={t("eventRequests.approve")}
															className="text-success hover:bg-success/10"
														>
															<Check className="size-3.5" />
														</Button>

														<Button
															size="icon-xs"
															variant="ghost"
															onClick={() => handleOpenReject(req)}
															title={t("eventRequests.reject")}
															className="text-destructive hover:bg-destructive/10"
														>
															<X className="size-3.5" />
														</Button>
													</>
												)}

												<Button
													size="icon-xs"
													variant="ghost"
													onClick={() => handleDeletePrompt(req)}
													title={t("common.delete")}
												>
													<Trash2 className="size-3.5 text-rose-500" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Create New Request Dialog */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<CalendarClock className="size-5 text-primary" />
							<span>{t("eventRequests.newRequest")}</span>
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
						<div>
							<Label>{t("eventRequests.eventName")}</Label>
							<Input
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="مثال: حفل زفاف ناصر وليلى"
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>{t("eventRequests.client")}</Label>
								<Input
									required
									value={formData.clientName}
									onChange={(e) =>
										setFormData({ ...formData, clientName: e.target.value })
									}
									placeholder="اسم العميل"
								/>
							</div>
							<div>
								<Label>الهاتف</Label>
								<Input
									required
									value={formData.clientPhone}
									onChange={(e) =>
										setFormData({ ...formData, clientPhone: e.target.value })
									}
									placeholder="+966 50 ..."
									dir="ltr"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>{t("eventRequests.hall")}</Label>
								<Select
									value={formData.hallName}
									onValueChange={(val) =>
										setFormData({ ...formData, hallName: val })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{halls.map((h) => (
											<SelectItem key={h.id} value={h.name}>
												{h.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>{t("eventRequests.guests")}</Label>
								<Input
									type="number"
									min="1"
									value={formData.guestCount}
									onChange={(e) =>
										setFormData({
											...formData,
											guestCount: Number(e.target.value),
										})
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>{t("eventRequests.startsAt")}</Label>
								<Input
									value={formData.startsAt}
									onChange={(e) =>
										setFormData({ ...formData, startsAt: e.target.value })
									}
									placeholder="2026-11-15 19:00"
								/>
							</div>
							<div>
								<Label>{t("eventRequests.endsAt")}</Label>
								<Input
									value={formData.endsAt}
									onChange={(e) =>
										setFormData({ ...formData, endsAt: e.target.value })
									}
									placeholder="2026-11-15 23:30"
								/>
							</div>
						</div>

						<div>
							<Label>{t("eventRequests.notes")}</Label>
							<Textarea
								value={formData.notes}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								placeholder="أي متطلبات أو تجهيزات خاصة..."
								rows={3}
							/>
						</div>

						<DialogFooter className="gap-2 sm:gap-0 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setCreateModalOpen(false)}
							>
								{t("common.cancel")}
							</Button>
							<Button type="submit">{t("common.save")}</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Details Modal */}
			<Dialog
				open={!!viewingRequest}
				onOpenChange={(open) => !open && setViewingRequest(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="size-5 text-primary" />
							<span>{t("eventRequests.details")}</span>
						</DialogTitle>
					</DialogHeader>
					{viewingRequest && (
						<div className="space-y-4 py-2 text-sm">
							<div className="p-3 bg-muted/40 rounded-xl space-y-2">
								<h3 className="font-bold text-base text-foreground">
									{viewingRequest.name}
								</h3>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Building2 className="size-3.5 text-primary" />
									<span>{viewingRequest.hallName}</span>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 text-xs">
								<div className="p-3 border rounded-xl space-y-1">
									<span className="text-muted-foreground">
										{t("eventRequests.client")}
									</span>
									<p className="font-bold text-foreground">
										{viewingRequest.clientName}
									</p>
									<p className="font-mono text-muted-foreground" dir="ltr">
										{viewingRequest.clientPhone}
									</p>
								</div>
								<div className="p-3 border rounded-xl space-y-1">
									<span className="text-muted-foreground">
										{t("eventRequests.guests")}
									</span>
									<p className="font-bold text-foreground flex items-center gap-1">
										<Users className="size-3.5 text-primary" />
										<span>{viewingRequest.guestCount}</span>
									</p>
									<span className="text-[10px] text-muted-foreground">
										{viewingRequest.eventTypeName}
									</span>
								</div>
							</div>

							<div className="p-3 border rounded-xl space-y-1 text-xs">
								<span className="text-muted-foreground">التوقيت والمواعيد</span>
								<p className="font-mono flex items-center gap-1.5 text-foreground">
									<Clock className="size-3.5 text-primary" />
									<span>
										{viewingRequest.startsAt} — {viewingRequest.endsAt}
									</span>
								</p>
							</div>

							{viewingRequest.notes && (
								<div className="p-3 border rounded-xl space-y-1 text-xs bg-muted/20">
									<span className="text-muted-foreground font-semibold">
										{t("eventRequests.notes")}:
									</span>
									<p className="text-foreground leading-relaxed">
										{viewingRequest.notes}
									</p>
								</div>
							)}

							{viewingRequest.rejectionReason && (
								<div className="p-3 border border-destructive/20 bg-destructive/5 rounded-xl space-y-1 text-xs text-destructive">
									<span className="font-bold flex items-center gap-1">
										<AlertCircle className="size-3.5" />
										<span>{t("eventRequests.rejectionReason")}:</span>
									</span>
									<p>{viewingRequest.rejectionReason}</p>
								</div>
							)}
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setViewingRequest(null)}
						>
							{t("common.close")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Prompt Dialog */}
			<Dialog
				open={!!rejectingRequest}
				onOpenChange={(open) => !open && setRejectingRequest(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertCircle className="size-5" />
							<span>{t("eventRequests.rejectionReasonTitle")}</span>
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleConfirmReject} className="space-y-4 py-2">
						<p className="text-xs text-muted-foreground">
							يرجى كتابة سبب رفض هذا الطلب لإشعار العميل به:
						</p>
						<Textarea
							required
							rows={3}
							value={rejectionReasonText}
							onChange={(e) => setRejectionReasonText(e.target.value)}
							placeholder={t("eventRequests.rejectionReasonPlaceholder")}
						/>
						<DialogFooter className="gap-2 sm:gap-0 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setRejectingRequest(null)}
							>
								{t("common.cancel")}
							</Button>
							<Button type="submit" variant="destructive">
								{t("eventRequests.reject")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Rejection Reason View Modal */}
			<Dialog
				open={!!activeRejectionView}
				onOpenChange={(open) => !open && setActiveRejectionView(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertCircle className="size-5" />
							<span>{t("eventRequests.rejectionReason")}</span>
						</DialogTitle>
					</DialogHeader>
					<div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive leading-relaxed">
						{activeRejectionView}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setActiveRejectionView(null)}
						>
							{t("common.close")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Confirm Approve Dialog */}
			<ConfirmDialog
				open={approveConfirmOpen}
				onOpenChange={setApproveConfirmOpen}
				onConfirm={handleConfirmApprove}
				title={t("eventRequests.approve")}
				description={t("eventRequests.approveConfirm")}
				itemName={requestToApprove ? `${requestToApprove.name} (${requestToApprove.clientName})` : undefined}
				variant="default"
				confirmText={t("eventRequests.approve")}
			/>

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				open={deleteConfirmOpen}
				onOpenChange={setDeleteConfirmOpen}
				onConfirm={handleConfirmDelete}
				itemName={requestToDelete ? `${requestToDelete.name} (${requestToDelete.clientName})` : undefined}
			/>
		</div>
	);
}

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	Plus,
	Search,
	CheckCircle2,
	Clock,
	UserCheck,
	Trash2,
	UserX,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
	useMockCollection,
	type ConfirmedAttendeeItem,
} from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function ConfirmedAttendeesPage() {
	const { t } = useTranslation();
	const {
		data: attendees,
		add,
		update,
		remove,
	} = useMockCollection<ConfirmedAttendeeItem>("confirmedAttendees");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [modalOpen, setModalOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newTable, setNewTable] = useState("T-01");
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [attendeeToDelete, setAttendeeToDelete] = useState<ConfirmedAttendeeItem | null>(null);

	const filteredAttendees = useMemo(() => {
		return attendees.filter((a) => {
			const query = searchTerm.toLowerCase();
			const matchesSearch =
				a.name.toLowerCase().includes(query) ||
				a.table.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "checked" && a.checkedIn) ||
				(statusFilter === "unchecked" && !a.checkedIn);
			return matchesSearch && matchesStatus;
		});
	}, [attendees, searchTerm, statusFilter]);

	const checkedCount = attendees.filter((a) => a.checkedIn).length;

	const toggleCheckIn = (attendee: ConfirmedAttendeeItem) => {
		const nextChecked = !attendee.checkedIn;
		const now = new Date();
		const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
			.getMinutes()
			.toString()
			.padStart(2, "0")}`;

		update(attendee.id, {
			checkedIn: nextChecked,
			time: nextChecked ? timeStr : undefined,
		});

		toast.success(
			nextChecked
				? t("confirmedAttendees.checkInSuccess")
				: t("confirmedAttendees.cancelCheckInSuccess"),
		);
	};

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newName) return;
		add({
			name: newName,
			table: newTable,
			checkedIn: false,
		});
		setNewName("");
		setModalOpen(false);
		toast.success(t("common.itemCreated"));
	};

	const handleDeletePrompt = (att: ConfirmedAttendeeItem) => {
		setAttendeeToDelete(att);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!attendeeToDelete) return;
		remove(attendeeToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setAttendeeToDelete(null);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<UserCheck className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("confirmedAttendees.title")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("confirmedAttendees.subtitle")}
						</p>
					</div>
				</div>
				<Button onClick={() => setModalOpen(true)} className="gap-1.5">
					<Plus className="size-4" />
					<span>{t("common.add")}</span>
				</Button>
			</div>

			{/* Progress Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Card className="relative overflow-hidden p-4 ps-5 flex items-center justify-between border-border bg-card">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-success" />
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-success/10 text-success">
							<CheckCircle2 className="size-5" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground font-medium">
								{t("confirmedAttendees.checkedIn")}
							</p>
							<p className="text-xl font-bold text-foreground">
								{checkedCount} / {attendees.length}
							</p>
						</div>
					</div>
				</Card>

				<Card className="relative overflow-hidden p-4 ps-5 flex items-center justify-between border-border bg-card">
					<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-warning" />
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-warning/10 text-warning">
							<Clock className="size-5" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground font-medium">
								{t("confirmedAttendees.notCheckedIn")}
							</p>
							<p className="text-xl font-bold text-foreground">
								{attendees.length - checkedCount}
							</p>
						</div>
					</div>
				</Card>
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
							<Label variant="filter">{t("common.status")}</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder={t("common.all")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("common.all")}</SelectItem>
									<SelectItem value="checked">
										{t("confirmedAttendees.checkedIn")}
									</SelectItem>
									<SelectItem value="unchecked">
										{t("confirmedAttendees.notCheckedIn")}
									</SelectItem>
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
							<TableHead>{t("confirmedAttendees.name")}</TableHead>
							<TableHead>{t("confirmedAttendees.table")}</TableHead>
							<TableHead className="text-center">{t("common.status")}</TableHead>
							<TableHead>{t("confirmedAttendees.time")}</TableHead>
							<TableHead className="w-36 text-end">
								{t("common.actions")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAttendees.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-24 text-center text-muted-foreground"
								>
									{t("common.noData")}
								</TableCell>
							</TableRow>
						) : (
							filteredAttendees.map((att) => {
								const firstLetter = att.name ? att.name.trim().charAt(0) : "?";
								return (
									<TableRow
										key={att.id}
										className="hover:bg-muted/50 transition-colors"
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar size="default">
													<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
														{firstLetter}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium text-sm text-foreground">
													{att.name}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="font-mono text-xs">
												{att.table}
											</Badge>
										</TableCell>
										<TableCell className="text-center">
											<Badge
												variant={att.checkedIn ? "success" : "warning"}
											>
												{att.checkedIn
													? t("confirmedAttendees.checkedIn")
													: t("confirmedAttendees.notCheckedIn")}
											</Badge>
										</TableCell>
										<TableCell className="text-xs text-muted-foreground font-mono">
											{att.time || "-"}
										</TableCell>
										<TableCell className="text-end">
											<div className="flex items-center justify-end gap-1.5">
												<Button
													variant={att.checkedIn ? "outline" : "default"}
													onClick={() => toggleCheckIn(att)}
													className="gap-1 text-xs"
												>
													{att.checkedIn ? (
														<UserX className="size-3.5" />
													) : (
														<UserCheck className="size-3.5" />
													)}
													<span>
														{att.checkedIn
															? t("confirmedAttendees.cancelCheckIn")
															: t("confirmedAttendees.checkIn")}
													</span>
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDeletePrompt(att)}
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

			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("common.add")}</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreate} className="space-y-4 py-2">
						<div>
							<Label>{t("confirmedAttendees.name")}</Label>
							<Input
								required
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder={t("confirmedAttendees.name")}
							/>
						</div>
						<div>
							<Label>{t("confirmedAttendees.table")}</Label>
							<Input
								required
								value={newTable}
								onChange={(e) => setNewTable(e.target.value)}
								placeholder="T-01 (VIP)"
							/>
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
				itemName={attendeeToDelete ? `${attendeeToDelete.name} (${attendeeToDelete.table})` : undefined}
			/>
		</div>
	);
}

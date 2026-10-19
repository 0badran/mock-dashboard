import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	MapPin,
	Search,
	Users,
	UserPlus,
	Clock,
	XCircle,
	CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useMockCollection,
	type ConfirmedAttendeeItem,
	type EventItem,
} from "@/services/mockStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function StatCard({
	title,
	count,
	percentage,
	accentColor,
}: {
	title: string;
	count: number;
	percentage: number;
	accentColor: string;
}) {
	return (
		<div className="relative overflow-hidden rounded-3xl p-5 ps-6 shadow-sm border border-border/60 bg-card flex flex-col justify-between h-36 animate-in fade-in duration-300">
			<div className={cn("absolute inset-y-0 inset-s-0 w-1.5", accentColor)} />
			<p className="text-sm font-medium text-muted-foreground">{title}</p>
			<div className="flex justify-between items-end">
				<h3 className="text-3xl font-black text-foreground">{count || 0}</h3>
				<span className="text-xs font-bold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-foreground">
					{percentage || 0}%
				</span>
			</div>
		</div>
	);
}

export default function CheckInPage() {
	const { t } = useTranslation();
	const {
		data: attendees,
		update,
	} = useMockCollection<ConfirmedAttendeeItem>("confirmedAttendees");
	const { data: events } = useMockCollection<EventItem>("events");

	const [selectedEventId, setSelectedEventId] = useState<string>("all");
	const [manualSearch, setManualSearch] = useState("");
	const [checkedInSearch, setCheckedInSearch] = useState("");

	// Separate checked-in vs pending candidates
	const totalExpected = attendees.length;
	const checkedInList = useMemo(() => {
		return attendees.filter((a) => {
			if (!a.checkedIn) return false;
			if (!checkedInSearch.trim()) return true;
			const q = checkedInSearch.toLowerCase();
			return a.name.toLowerCase().includes(q) || a.table.toLowerCase().includes(q);
		});
	}, [attendees, checkedInSearch]);

	const candidatesList = useMemo(() => {
		return attendees.filter((a) => {
			if (a.checkedIn) return false;
			if (!manualSearch.trim()) return true;
			const q = manualSearch.toLowerCase();
			return a.name.toLowerCase().includes(q) || a.table.toLowerCase().includes(q);
		});
	}, [attendees, manualSearch]);

	const checkedInCount = attendees.filter((a) => a.checkedIn).length;
	const pendingCount = totalExpected - checkedInCount;
	const percentage =
		totalExpected > 0 ? Math.round((checkedInCount / totalExpected) * 100) : 0;

	const handleCheckIn = (attendee: ConfirmedAttendeeItem) => {
		const now = new Date();
		const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
			.getMinutes()
			.toString()
			.padStart(2, "0")}`;

		update(attendee.id, {
			checkedIn: true,
			time: timeStr,
		});

		toast.success(
			`${t("checkIn.checkedInSuccess")}: ${attendee.name}`,
		);
	};

	const handleCancelCheckIn = (attendee: ConfirmedAttendeeItem) => {
		update(attendee.id, {
			checkedIn: false,
			time: undefined,
		});

		toast.info(
			`${t("checkIn.cancelledSuccess")}: ${attendee.name}`,
		);
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<MapPin className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("sidebar.check_in")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("checkIn.subtitle")}
						</p>
					</div>
				</div>

				{/* Event Selector */}
				<div className="w-full sm:w-64">
					<Select value={selectedEventId} onValueChange={setSelectedEventId}>
						<SelectTrigger className="h-10 rounded-xl">
							<SelectValue placeholder={t("checkIn.selectEvent")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("common.all")}</SelectItem>
							{events.map((ev) => (
								<SelectItem key={ev.id} value={ev.id}>
									{ev.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Statistics Grid */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				{/* Progress Statistics Card */}
				<div className="col-span-2 md:col-span-3 lg:col-span-2 gradient-primary text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-36">
					<div className="flex justify-between items-start">
						<div>
							<p className="text-white/80 text-sm font-medium">
								{t("checkIn.checkedIn")}
							</p>
							<h3 className="text-4xl font-black mt-1">{checkedInCount}</h3>
						</div>
						<span className="text-white/70 text-xs font-semibold self-end">
							{t("checkIn.outOf")} {totalExpected}
						</span>
					</div>

					<div className="w-full mt-4">
						<div className="h-6 w-full bg-white/20 rounded-full p-1 relative flex items-center">
							<motion.div
								className="h-full bg-white rounded-full flex items-center justify-end px-2.5 transition-all duration-300"
								style={{ width: `${Math.max(percentage, 8)}%` }}
								initial={{ width: "0%" }}
								animate={{ width: `${Math.max(percentage, 8)}%` }}
							>
								<span className="text-primary text-[10px] font-black">
									{percentage}%
								</span>
							</motion.div>
						</div>
					</div>
				</div>

				{/* KPI Cards */}
				<StatCard
					title={t("checkIn.attending")}
					count={totalExpected}
					percentage={100}
					accentColor="bg-success"
				/>
				<StatCard
					title={t("checkIn.checkedIn")}
					count={checkedInCount}
					percentage={percentage}
					accentColor="bg-primary"
				/>
				<StatCard
					title={t("checkIn.pendingCheckIn")}
					count={pendingCount}
					percentage={totalExpected > 0 ? 100 - percentage : 0}
					accentColor="bg-warning"
				/>

				{/* Timing Stats Card */}
				<div className="col-span-2 md:col-span-3 lg:col-span-2 bg-card rounded-3xl p-5 shadow-sm border border-border/50 flex flex-col justify-between h-36">
					<p className="text-sm font-medium">{t("checkIn.checkInRate")}</p>
					<div className="flex flex-col mt-2 gap-1.5 flex-1 justify-end">
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">
								{t("checkIn.peakTime")}:
							</span>
							<span className="font-bold font-mono">19:30 - 20:30</span>
						</div>
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">
								{t("checkIn.avgEntrySpeed")}:
							</span>
							<span className="font-bold text-success">
								~15s / {t("checkIn.guest")}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main Split Columns (Manual Check-In vs Checked-In) */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
				{/* Column 1: Candidates to check in */}
				<div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm space-y-4">
					<div className="flex items-center justify-between border-b border-border/50 pb-3">
						<div className="flex items-center gap-2">
							<Users className="size-5 text-primary" />
							<h3 className="font-bold text-foreground text-base">
								{t("checkIn.manualCheckIn")}
							</h3>
						</div>
						<Badge variant="outline" className="font-mono text-xs">
							{candidatesList.length}
						</Badge>
					</div>

					{/* Search */}
					<div className="relative">
						<Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							placeholder={t("checkIn.searchNameTable")}
							value={manualSearch}
							onChange={(e) => setManualSearch(e.target.value)}
							className="ps-9 h-10 rounded-xl"
						/>
					</div>

					{/* Candidates List */}
					<div className="space-y-2.5 max-h-115 overflow-y-auto pe-1">
						<AnimatePresence mode="popLayout">
							{candidatesList.length === 0 ? (
								<div className="text-center py-12 text-sm text-muted-foreground">
									{manualSearch
										? t("common.noData")
										: t("checkIn.allGuestsCheckedIn")}
								</div>
							) : (
								candidatesList.map((attendee) => (
									<motion.div
										key={attendee.id}
										layout
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95 }}
										className="flex items-center justify-between p-3.5 bg-header hover:bg-primary/5 border border-primary/10 rounded-2xl transition-all duration-200"
									>
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="size-10 border border-primary/10 shrink-0">
												<AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
													{attendee.name.trim().charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0">
												<h4 className="font-bold text-foreground text-sm truncate">
													{attendee.name}
												</h4>
												<p className="text-xs text-muted-foreground font-mono mt-0.5">
													{attendee.table}
												</p>
											</div>
										</div>

										<Button
											size="xs"
											onClick={() => handleCheckIn(attendee)}
											className="gap-1.5 rounded-xl font-bold shrink-0"
										>
											<UserPlus className="size-3.5" />
											<span>{t("checkIn.checkInBtn")}</span>
										</Button>
									</motion.div>
								))
							)}
						</AnimatePresence>
					</div>
				</div>

				{/* Column 2: Already Checked-In */}
				<div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm space-y-4">
					<div className="flex items-center justify-between border-b border-border/50 pb-3">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="size-5 text-emerald-600" />
							<h3 className="font-bold text-foreground text-base">
								{t("checkIn.alreadyCheckedIn")}
							</h3>
						</div>
						<Badge variant="success" className="font-mono text-xs">
							{checkedInList.length}
						</Badge>
					</div>

					{/* Search */}
					<div className="relative">
						<Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							placeholder={t("checkIn.searchNameTable")}
							value={checkedInSearch}
							onChange={(e) => setCheckedInSearch(e.target.value)}
							className="ps-9 h-10 rounded-xl"
						/>
					</div>

					{/* Checked-In List */}
					<div className="space-y-2.5 max-h-115 overflow-y-auto pe-1">
						<AnimatePresence mode="popLayout">
							{checkedInList.length === 0 ? (
								<div className="text-center py-12 text-sm text-muted-foreground">
									{t("checkIn.noOneCheckedInYet")}
								</div>
							) : (
								checkedInList.map((attendee) => (
									<motion.div
										key={attendee.id}
										layout
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95 }}
										className="flex items-center justify-between p-3.5 bg-success/5 hover:bg-success/10 border border-success/20 rounded-2xl transition-all duration-200"
									>
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="size-10 border border-success/20 shrink-0">
												<AvatarFallback className="bg-success/10 text-success text-sm font-bold">
													{attendee.name.trim().charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0">
												<h4 className="font-bold text-foreground text-sm truncate">
													{attendee.name}
												</h4>
												<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
													<span className="font-mono">{attendee.table}</span>
													<span>•</span>
													<span className="font-mono text-success font-semibold flex items-center gap-1">
														<Clock className="size-3" />
														{attendee.time || "19:40"}
													</span>
												</div>
											</div>
										</div>

										<Button
											size="xs"
											variant="outline"
											onClick={() => handleCancelCheckIn(attendee)}
											className="gap-1.5 rounded-xl text-xs hover:border-rose-500/40 hover:text-rose-600 shrink-0"
										>
											<XCircle className="size-3.5" />
											<span>{t("checkIn.cancelBtn")}</span>
										</Button>
									</motion.div>
								))
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}

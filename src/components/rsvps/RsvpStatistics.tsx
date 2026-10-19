import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Smile } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

interface RsvpStatisticsProps {
	totalRsvps: number;
	attendingCount: number;
	pendingCount: number;
	declinedCount: number;
	totalCompanions: number;
	statusFilter: string;
	onSelectFilter: (filter: string) => void;
}

export const RsvpStatistics: React.FC<RsvpStatisticsProps> = ({
	totalRsvps,
	attendingCount,
	pendingCount,
	declinedCount,
	totalCompanions,
	statusFilter,
	onSelectFilter,
}) => {
	const { t } = useTranslation();

	const totalConfirmedAttendees = attendingCount + totalCompanions;
	const repliedCount = attendingCount + declinedCount;
	const openedCount = Math.min(
		totalRsvps,
		repliedCount + (pendingCount > 0 ? Math.max(1, Math.round(pendingCount * 0.75)) : 0),
	);

	const attendanceRate =
		totalRsvps > 0 ? Math.round((attendingCount / totalRsvps) * 100) : 0;
	const totalConfirmedAttendeesPct =
		totalRsvps > 0
			? Math.min(100, Math.round((totalConfirmedAttendees / totalRsvps) * 100))
			: 0;
	const declinedRate =
		totalRsvps > 0 ? Math.round((declinedCount / totalRsvps) * 100) : 0;
	const openRate =
		totalRsvps > 0 ? Math.round((openedCount / totalRsvps) * 100) : 0;
	const responseRate =
		totalRsvps > 0 ? Math.round((repliedCount / totalRsvps) * 100) : 0;

	const formatGuestsCount = (count: number) => `${count} ${t("rsvps.guestUnit")}`;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
			{/* Progress Bars Card */}
			<div className="lg:col-span-7 bg-card border rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
				<div className="space-y-4">
					{[
						{
							label: t("rsvps.totalInvitations"),
							count: totalRsvps,
							pct: totalRsvps > 0 ? 100 : 0,
							cls: "gradient-primary",
							filter: "all",
						},
						{
							label: t("rsvps.opened"),
							count: openedCount,
							pct: openRate,
							cls: "gradient-primary opacity-85",
							filter: null,
						},
						{
							label: t("rsvps.replied"),
							count: repliedCount,
							pct: responseRate,
							cls: "gradient-primary opacity-65",
							filter: null,
						},
						{
							label: t("rsvps.attendanceConfirmed"),
							count: attendingCount,
							pct: attendanceRate,
							cls: "gradient-primary opacity-45",
							filter: "attending",
						},
						{
							label: t("rsvps.totalConfirmedAttendees"),
							count: totalConfirmedAttendees,
							pct: totalConfirmedAttendeesPct,
							cls: "gradient-primary opacity-35",
							filter: "attending",
						},
						{
							label: t("rsvps.apologized"),
							count: declinedCount,
							pct: declinedRate,
							cls: "gradient-primary opacity-25",
							filter: "declined",
						},
					].map(({ label, count, pct, cls, filter }) => (
						<div
							key={label}
							onClick={() => {
								if (filter) {
									onSelectFilter(filter === statusFilter && filter !== "all" ? "all" : filter);
								}
							}}
							className={cn(
								"flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",
								filter && "cursor-pointer group",
							)}
						>
							<div className="flex items-center justify-between sm:w-28 shrink-0">
								<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
									{label}
								</span>
								<span className="sm:hidden text-sm font-bold text-foreground">
									{formatGuestsCount(count)}
								</span>
							</div>
							<div className="flex-1 flex items-center gap-4 w-full">
								<div className="flex-1 h-7 rounded-full overflow-hidden relative bg-muted/40">
									<div
										className={cn(
											cls,
											"h-full rounded-full flex items-center justify-center text-center transition-all duration-500",
										)}
										style={{ width: `${Math.max(pct, pct > 0 ? 6 : 0)}%` }}
									>
										<span className="text-[10px] font-bold text-primary-foreground leading-none">
											{pct}%
										</span>
									</div>
								</div>
								<span className="hidden sm:inline w-20 text-sm font-bold text-foreground text-end shrink-0">
									{formatGuestsCount(count)}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* 4 Small Cards Grid */}
			<div className="lg:col-span-5 grid grid-cols-2 gap-4">
				{/* Best Response Time */}
				<div className="bg-card border rounded-3xl p-4 sm:p-5 flex flex-col justify-between min-h-25 sm:min-h-30 shadow-sm hover:border-primary/30 transition-all duration-300">
					<div className="flex items-baseline justify-between mt-2 gap-1">
						<span className="text-[10px] sm:text-xs font-semibold text-muted-foreground truncate">
							{t("rsvps.bestResponseTime")}
						</span>
					</div>
					<span className="text-lg sm:text-xl font-bold text-primary block truncate">
						{t("rsvps.within24Hours")}
					</span>
				</div>

				{/* Needs Follow up */}
				<div
					onClick={() => onSelectFilter(statusFilter === "pending" ? "all" : "pending")}
					className={cn(
						"bg-card border rounded-3xl p-4 sm:p-5 flex flex-col justify-between min-h-25 sm:min-h-30 shadow-sm hover:border-primary/30 transition-all duration-300 cursor-pointer",
						statusFilter === "pending" && "ring-1 ring-primary/40 border-primary",
					)}
				>
					<div className="flex items-baseline justify-between mt-2 gap-1">
						<span className="text-[10px] sm:text-xs font-semibold text-muted-foreground truncate">
							{t("rsvps.needsFollowUp")}
						</span>
					</div>
					<span className="text-xl sm:text-2xl font-bold text-primary block">
						{formatGuestsCount(pendingCount)}
					</span>
				</div>

				{/* Open Rate */}
				<div className="bg-card border rounded-3xl p-4 sm:p-5 flex flex-col justify-between min-h-25 sm:min-h-30 shadow-sm hover:border-primary/30 transition-all duration-300">
					<span className="text-[10px] sm:text-xs font-semibold text-muted-foreground truncate">
						{t("rsvps.openRate")}
					</span>
					<div className="flex items-baseline justify-between mt-2 gap-1">
						<span className="text-2xl sm:text-3xl font-bold text-primary block">
							{openRate}%
						</span>
						<CircularProgress
							value={openRate}
							icon={Users}
							strokeColor="stroke-indigo-500"
							trackColor="stroke-indigo-100 dark:stroke-indigo-900/30"
							iconClassName="text-indigo-500 dark:text-indigo-400"
						/>
					</div>
				</div>

				{/* Response Rate */}
				<div className="bg-card border rounded-3xl p-4 sm:p-5 flex flex-col justify-between min-h-25 sm:min-h-30 shadow-sm hover:border-primary/30 transition-all duration-300">
					<span className="text-[10px] sm:text-xs font-semibold text-muted-foreground truncate">
						{t("rsvps.responseRate")}
					</span>
					<div className="flex items-baseline justify-between mt-2 gap-1">
						<span className="text-2xl sm:text-3xl font-bold text-primary block">
							{responseRate}%
						</span>
						<CircularProgress
							value={responseRate}
							icon={Smile}
							strokeColor="stroke-emerald-500"
							trackColor="stroke-emerald-100 dark:stroke-emerald-900/30"
							iconClassName="text-emerald-500 dark:text-emerald-400"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

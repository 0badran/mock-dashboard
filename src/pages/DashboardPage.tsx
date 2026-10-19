import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
	Users,
	Contact,
	MailOpen,
	CalendarDays,
	Calendar,
	Sparkles,
	ArrowUpRight,
	CheckCircle2,
	Clock,
	XCircle,
	Plus,
	Zap,
	ClipboardList,
	BarChart3,
	PieChart as PieChartIcon,
	TrendingUp,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
	type ChartConfig,
} from "@/components/ui/chart";
import {
	useMockCollection,
	type ClientItem,
	type GuestItem,
	type RsvpItem,
	type EventItem,
} from "@/services/mockStorage";

export default function DashboardPage() {
	const { t, i18n } = useTranslation();
	const { data: clients } = useMockCollection<ClientItem>("clients");
	const { data: guests } = useMockCollection<GuestItem>("guests");
	const { data: rsvps } = useMockCollection<RsvpItem>("rsvps");
	const { data: events } = useMockCollection<EventItem>("events");

	const totalRsvps = rsvps.length;
	const attendingCount = rsvps.filter((r) => r.response === "attending").length;
	const declinedCount = rsvps.filter((r) => r.response === "declined").length;
	const pendingCount = rsvps.filter((r) => r.response === "pending").length;
	const attendanceRate =
		totalRsvps > 0 ? Math.round((attendingCount / totalRsvps) * 100) : 0;

	const stats = [
		{
			title: t("dashboard.totalEvents"),
			value: events.length,
			icon: CalendarDays,
			change: "+12% هذا الشهر",
			changeType: "positive" as const,
			link: "/events",
		},
		{
			title: t("dashboard.totalClients"),
			value: clients.length,
			icon: Contact,
			change: "+4 جدد",
			changeType: "positive" as const,
			link: "/clients",
		},
		{
			title: t("dashboard.totalGuests"),
			value: guests.length,
			icon: Users,
			change: `${attendanceRate}% نسبة التأكيد`,
			changeType: "neutral" as const,
			link: "/guests",
		},
		{
			title: t("dashboard.totalRsvps"),
			value: totalRsvps,
			icon: MailOpen,
			change: `${attendingCount} مؤكد`,
			changeType: "positive" as const,
			link: "/rsvps",
		},
	];

	// Chart Configs for shadcn ChartContainer
	const activityChartConfig = {
		guests: {
			label: t("dashboard.invitedGuests"),
			color: "hsl(var(--chart-1))",
		},
		attending: {
			label: t("dashboard.confirmedGuests"),
			color: "hsl(var(--chart-3))",
		},
	} satisfies ChartConfig;

	const rsvpChartConfig = {
		count: {
			label: t("dashboard.totalRsvps"),
		},
		attending: {
			label: t("rsvps.attending"),
			color: "hsl(var(--chart-3))",
		},
		pending: {
			label: t("rsvps.pending"),
			color: "hsl(var(--chart-4))",
		},
		declined: {
			label: t("rsvps.declined"),
			color: "hsl(var(--destructive))",
		},
	} satisfies ChartConfig;

	// Real data-driven chart datasets
	const activityChartData = React.useMemo(() => {
		const monthKeys = [
			{ key: "2026-06", date: new Date(2026, 5, 1) },
			{ key: "2026-07", date: new Date(2026, 6, 1) },
			{ key: "2026-08", date: new Date(2026, 7, 1) },
			{ key: "2026-09", date: new Date(2026, 8, 1) },
			{ key: "2026-10", date: new Date(2026, 9, 1) },
			{ key: "2026-11", date: new Date(2026, 10, 1) },
		];

		return monthKeys.map(({ key, date }) => {
			const monthName = new Intl.DateTimeFormat(i18n.language, {
				month: "short",
			}).format(date);
			const matchedEvents = events.filter((e) => e.date?.startsWith(key));
			const matchedClients = clients.filter((c) =>
				c.eventDate?.startsWith(key),
			);

			const eventCapacity =
				matchedEvents.reduce((acc, curr) => acc + (curr.capacity || 0), 0) +
				matchedClients.reduce((acc, curr) => acc + (curr.guestsCount || 0), 0);

			const countEvents = matchedEvents.length + matchedClients.length;
			const guestsInvited =
				countEvents > 0
					? eventCapacity
					: guests.length > 0
						? guests.length * 20
						: 60;
			const rate = attendanceRate > 0 ? attendanceRate / 100 : 0.72;
			const confirmed = Math.round(guestsInvited * rate);

			return {
				month: monthName,
				guests: guestsInvited,
				attending: confirmed,
			};
		});
	}, [events, clients, guests, attendanceRate, i18n.language]);

	const rsvpChartData = React.useMemo(
		() => [
			{
				status: "attending",
				count: attendingCount,
				fill: "var(--color-attending)",
			},
			{ status: "pending", count: pendingCount, fill: "var(--color-pending)" },
			{
				status: "declined",
				count: declinedCount,
				fill: "var(--color-declined)",
			},
		],
		[attendingCount, pendingCount, declinedCount],
	);

	const categoryData = React.useMemo(() => {
		const total = guests.length || 1;
		const vips = guests.filter((g) => g.category === "vip").length;
		const family = guests.filter((g) => g.category === "family").length;
		const friends = guests.filter((g) => g.category === "friends").length;
		const colleagues = guests.filter((g) => g.category === "colleagues").length;

		return [
			{
				key: "vip",
				label: t("guests.vip"),
				count: vips,
				percentage: Math.round((vips / total) * 100),
				bgClass: "bg-primary",
			},
			{
				key: "family",
				label: t("guests.family"),
				count: family,
				percentage: Math.round((family / total) * 100),
				bgClass: "bg-success",
			},
			{
				key: "friends",
				label: t("guests.friends"),
				count: friends,
				percentage: Math.round((friends / total) * 100),
				bgClass: "bg-warning",
			},
			{
				key: "colleagues",
				label: t("guests.colleagues"),
				count: colleagues,
				percentage: Math.round((colleagues / total) * 100),
				bgClass: "bg-accent",
			},
		];
	}, [guests, t]);

	const pendingTasks = [
		{
			title: "تأكيد قائمة كبار الشخصيات",
			desc: "حفل زفاف سارة ومحمد - القاعة الملكية",
			count: "3 مهام",
			link: "/guests",
		},
		{
			title: "مراجعة تصاميم قوالب الدعوات",
			desc: "قالب زفاف ملكي جديد",
			count: "1 قالب",
			link: "/invitations",
		},
		{
			title: "مراجعة طلبات حجز المناسبات",
			desc: "طلبات معلقة بانتظار الاعتماد",
			count: "3 طلبات",
			link: "/event-requests",
		},
	];

	return (
		<div className="space-y-6">
			{/* Header Banner */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
			>
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
							{t("dashboard.title")}
						</h1>
						<Badge variant="secondary" className="gap-1 text-xs">
							<Sparkles className="size-3 text-primary" />
							{t("common.guestMode")}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground mt-1">
						{t("dashboard.subtitle")}
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<Button asChild>
						<Link to="/clients">
							<Plus className="size-4 me-1.5" />
							{t("clients.addClient")}
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link to="/events">
							<Calendar className="size-4 me-1.5" />
							{t("events.title")}
						</Link>
					</Button>
				</div>
			</motion.div>

			{/* Stats Cards Row */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat, index) => (
					<StatCard
						key={stat.title}
						title={stat.title}
						value={stat.value}
						change={stat.change}
						changeType={stat.changeType}
						icon={stat.icon}
						link={stat.link}
						delay={index}
					/>
				))}
			</div>

			{/* Interactive Charts Section (shadcn ChartContainer & Recharts) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Events & Attendance Bar Chart (2 columns on lg) */}
				<div className="lg:col-span-2">
					<Card variant="elevated">
						<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
							<div>
								<CardTitle className="text-base flex items-center gap-2">
									<BarChart3 className="size-4.5 text-primary" />
									<span>{t("dashboard.eventsChartTitle")}</span>
								</CardTitle>
								<CardDescription>
									{t("dashboard.eventsChartDesc")}
								</CardDescription>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-xl border border-border/40 shrink-0">
								<TrendingUp className="size-3.5 text-success" />
								<span className="font-semibold text-foreground">
									{attendanceRate}%
								</span>
								<span>{t("dashboard.attendanceRate")}</span>
							</div>
						</CardHeader>
						<CardContent className="pt-2">
							<ChartContainer
								config={activityChartConfig}
								className="h-70 w-full"
							>
								<BarChart
									data={activityChartData}
									margin={{ top: 20, right: 12, left: 12, bottom: 0 }}
								>
									<CartesianGrid
										vertical={false}
										strokeDasharray="3 3"
										className="stroke-border/40"
									/>
									<XAxis
										dataKey="month"
										tickLine={false}
										tickMargin={10}
										axisLine={false}
										className="text-xs font-medium"
									/>
									<YAxis
										tickLine={false}
										axisLine={false}
										tickMargin={10}
										className="text-xs font-medium"
									/>
									<ChartTooltip content={<ChartTooltipContent />} />
									<ChartLegend content={<ChartLegendContent />} />
									<Bar
										dataKey="guests"
										fill="var(--color-guests)"
										radius={[6, 6, 0, 0]}
										maxBarSize={44}
									/>
									<Bar
										dataKey="attending"
										fill="var(--color-attending)"
										radius={[6, 6, 0, 0]}
										maxBarSize={44}
									/>
								</BarChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</div>

				{/* RSVP Responses Donut Chart (1 column on lg) */}
				<div className="lg:col-span-1">
					<Card variant="elevated">
						<CardHeader className="pb-2">
							<CardTitle className="text-base flex items-center gap-2">
								<PieChartIcon className="size-4.5 text-primary" />
								<span>{t("dashboard.rsvpsChartTitle")}</span>
							</CardTitle>
							<CardDescription>{t("dashboard.rsvpsChartDesc")}</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col items-center">
							<ChartContainer
								config={rsvpChartConfig}
								className="mx-auto aspect-square max-h-55 w-full"
							>
								<PieChart>
									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent hideLabel />}
									/>
									<Pie
										data={rsvpChartData}
										dataKey="count"
										nameKey="status"
										innerRadius={65}
										strokeWidth={4}
										className="stroke-card"
									>
										<Label
											content={({ viewBox }) => {
												if (viewBox && "cx" in viewBox && "cy" in viewBox) {
													return (
														<text
															x={viewBox.cx}
															y={viewBox.cy}
															textAnchor="middle"
															dominantBaseline="middle"
														>
															<tspan
																x={viewBox.cx}
																y={viewBox.cy}
																className="fill-foreground text-3xl font-extrabold"
															>
																{totalRsvps}
															</tspan>
															<tspan
																x={viewBox.cx}
																y={(viewBox.cy || 0) + 22}
																className="fill-muted-foreground text-xs font-medium"
															>
																{t("dashboard.totalRsvps")}
															</tspan>
														</text>
													);
												}
											}}
										/>
									</Pie>
								</PieChart>
							</ChartContainer>

							{/* Status Breakdown Badges below Donut */}
							<div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-border/50 text-center">
								<div className="space-y-0.5 p-2 rounded-xl bg-success/10">
									<p className="text-[11px] font-medium text-success">
										{t("rsvps.attending")}
									</p>
									<p className="text-base font-bold text-success">
										{attendingCount}
									</p>
								</div>
								<div className="space-y-0.5 p-2 rounded-xl bg-warning/10">
									<p className="text-[11px] font-medium text-warning">
										{t("rsvps.pending")}
									</p>
									<p className="text-base font-bold text-warning">
										{pendingCount}
									</p>
								</div>
								<div className="space-y-0.5 p-2 rounded-xl bg-destructive/10">
									<p className="text-[11px] font-medium text-destructive">
										{t("rsvps.declined")}
									</p>
									<p className="text-base font-bold text-destructive">
										{declinedCount}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Two Column Layout: Events Table & Operations / Categories */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column (2 cols): Recent Events / Invitations */}
				<div className="lg:col-span-2 space-y-6">
					<Card variant="elevated">
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<div>
								<CardTitle>{t("dashboard.recentEvents")}</CardTitle>
								<CardDescription>
									أحدث المناسبات المسجلة وحالات الحضور
								</CardDescription>
							</div>
							<Button asChild variant="ghost">
								<Link
									to="/events"
									className="gap-1 text-xs text-primary font-semibold"
								>
									<span>
										{t("common.view")} {t("common.all")}
									</span>
									<ArrowUpRight className="size-3.5" />
								</Link>
							</Button>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full text-sm text-start">
									<thead>
										<tr className="border-b border-border/60 text-xs text-muted-foreground">
											<th className="py-2.5 px-3 text-start">
												{t("events.eventName")}
											</th>
											<th className="py-2.5 px-3 text-start">
												{t("events.client")}
											</th>
											<th className="py-2.5 px-3 text-start">
												{t("events.date")}
											</th>
											<th className="py-2.5 px-3 text-start">
												{t("events.venue")}
											</th>
											<th className="py-2.5 px-3 text-start">
												{t("events.status")}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/40">
										{events.slice(0, 4).map((evt) => (
											<tr
												key={evt.id}
												className="hover:bg-muted/40 transition-colors"
											>
												<td className="py-3 px-3 font-semibold text-foreground">
													{evt.title}
												</td>
												<td className="py-3 px-3 text-muted-foreground">
													{evt.client}
												</td>
												<td className="py-3 px-3 text-xs text-muted-foreground font-mono">
													{evt.date}
												</td>
												<td className="py-3 px-3 text-xs">{evt.hall}</td>
												<td className="py-3 px-3">
													<Badge
														variant={
															evt.status === "planned" ||
															evt.status === "ongoing"
																? "default"
																: "secondary"
														}
														className="text-xs"
													>
														{t(`events.${evt.status}`)}
													</Badge>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					{/* Quick Stats Summary Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<Card variant="elevated" className="relative overflow-hidden border-border ps-2">
							<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-success" />
							<CardContent className="p-4 flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground font-medium">
										{t("rsvps.attending")}
									</p>
									<p className="text-2xl font-bold text-foreground">
										{attendingCount}
									</p>
								</div>
								<div className="p-3 rounded-2xl bg-success/10 text-success">
									<CheckCircle2 className="size-5" />
								</div>
							</CardContent>
						</Card>

						<Card variant="elevated" className="relative overflow-hidden border-border ps-2">
							<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-warning" />
							<CardContent className="p-4 flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground font-medium">
										{t("rsvps.pending")}
									</p>
									<p className="text-2xl font-bold text-foreground">
										{pendingCount}
									</p>
								</div>
								<div className="p-3 rounded-2xl bg-warning/10 text-warning">
									<Clock className="size-5" />
								</div>
							</CardContent>
						</Card>

						<Card variant="elevated" className="relative overflow-hidden border-border ps-2">
							<div className="absolute inset-y-0 inset-s-0 w-1.5 bg-destructive" />
							<CardContent className="p-4 flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground font-medium">
										{t("rsvps.declined")}
									</p>
									<p className="text-2xl font-bold text-foreground">
										{declinedCount}
									</p>
								</div>
								<div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
									<XCircle className="size-5" />
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Right Column (1 col): Guest Categories Breakdown & Pending Tasks & Quick Actions */}
				<div className="space-y-6">
					{/* Guest Categories Breakdown Card */}
					<Card variant="elevated">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2">
								<Users className="size-4.5 text-primary" />
								<span>{t("dashboard.categoriesChartTitle")}</span>
							</CardTitle>
							<CardDescription>
								{t("dashboard.categoriesChartDesc")}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{categoryData.map((item) => (
								<div key={item.key} className="space-y-1.5">
									<div className="flex items-center justify-between text-xs">
										<span className="font-medium text-foreground">
											{item.label}
										</span>
										<span className="text-muted-foreground font-mono">
											{item.count} ({item.percentage}%)
										</span>
									</div>
									<div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
										<div
											className={item.bgClass}
											style={{ width: `${item.percentage}%`, height: "100%" }}
										/>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Pending Tasks */}
					<Card variant="elevated">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2">
								<ClipboardList className="size-4.5 text-primary" />
								<span>المهام والتنبيهات المعلقة</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2.5">
							{pendingTasks.map((task) => (
								<Link
									key={task.title}
									to={task.link}
									className="flex items-center justify-between p-3 rounded-2xl border border-border/50 hover:border-primary/40 hover:bg-muted/40 transition-all group"
								>
									<div className="space-y-0.5">
										<p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
											{task.title}
										</p>
										<p className="text-[11px] text-muted-foreground">
											{task.desc}
										</p>
									</div>
									<span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
										{task.count}
									</span>
								</Link>
							))}
						</CardContent>
					</Card>

					{/* Quick Shortcuts */}
					<Card variant="elevated">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2">
								<Zap className="size-4.5 text-amber-500" />
								<span>{t("dashboard.quickActions")}</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-2">
							<Button
								asChild
								variant="outline"
								className="h-auto py-2.5 flex flex-col gap-1 rounded-2xl"
							>
								<Link to="/guests">
									<Users className="size-4 text-primary" />
									<span className="text-xs">{t("guests.addGuest")}</span>
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-auto py-2.5 flex flex-col gap-1 rounded-2xl"
							>
								<Link to="/events">
									<Calendar className="size-4 text-emerald-500" />
									<span className="text-xs">
										{t("events.addEvent")}
									</span>
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-auto py-2.5 flex flex-col gap-1 rounded-2xl"
							>
								<Link to="/notify-broadcasts">
									<MailOpen className="size-4 text-purple-500" />
									<span className="text-xs">
										{t("broadcasts.sendBroadcast")}
									</span>
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-auto py-2.5 flex flex-col gap-1 rounded-2xl"
							>
								<Link to="/settings">
									<Sparkles className="size-4 text-blue-500" />
									<span className="text-xs">{t("settings.title")}</span>
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

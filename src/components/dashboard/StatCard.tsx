import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

export interface StatCardProps {
	title: string;
	value: string | number;
	change?: string;
	changeType?: "positive" | "negative" | "neutral";
	icon?: LucideIcon;
	iconColor?: string;
	iconBgColor?: string;
	delay?: number;
	link?: string;
}

export function StatCard({
	title,
	value,
	change,
	changeType = "neutral",
	delay = 0,
	link,
}: StatCardProps) {
	if (value === undefined || value === null || value === "") return null;

	const cardContent = (
		<Card
			variant="elevated"
			className={`overflow-hidden h-full shadow-none ${delay === 0 ? "gradient-primary text-white" : ""} p-0!`}
		>
			<CardContent className="p-0! h-full">
				<div className="flex items-start justify-between h-full p-3 lg:p-5 hover:bg-primary/10 transition-colors">
					<div className="space-y-2">
						<p className={cn("text-sm font-medium", delay === 0 ? "text-white/90" : "text-muted-foreground")}>{title}</p>
						<p className="text-2xl font-bold tracking-tight">{value}</p>
						{change && (
							<p
								className={cn(
									"text-xs font-medium flex items-center gap-1",
									changeType === "positive" && "text-emerald-500",
									changeType === "negative" && "text-rose-500",
									changeType === "neutral" && "text-muted-foreground",
								)}
							>
								{changeType === "positive" && "↑"}
								{changeType === "negative" && "↓"}
								{change}
							</p>
						)}
					</div>
					{link && (
						<div className={cn("p-2 rounded-full border", delay === 0 ? "border-white/30 text-white" : "border-border/60")}>
							<ArrowUpRight className="size-4" />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay }}
			className="flex-1 shrink-0 min-w-50"
		>
			{link ? (
				<Link to={link} className="block h-full cursor-pointer">
					{cardContent}
				</Link>
			) : (
				cardContent
			)}
		</motion.div>
	);
}

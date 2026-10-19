import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value: number;
	icon?: LucideIcon | React.ComponentType<{ className?: string }>;
	strokeColor?: string;
	trackColor?: string;
	iconClassName?: string;
	strokeWidth?: number;
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
	(
		{
			value,
			icon: Icon,
			strokeColor = "stroke-primary",
			trackColor = "stroke-muted/30",
			iconClassName,
			className,
			strokeWidth = 2.5,
			...props
		},
		ref,
	) => {
		const clampedValue = Math.min(100, Math.max(0, value));
		const radius = 14;
		const circumference = 2 * Math.PI * radius;
		const strokeDashoffset = circumference * (1 - clampedValue / 100);

		return (
			<div
				ref={ref}
				className={cn(
					"relative flex items-center justify-center size-9 sm:size-10 shrink-0",
					className,
				)}
				{...props}
			>
				<svg
					className="absolute inset-0 size-full -rotate-90"
					viewBox="0 0 36 36"
				>
					<circle
						cx="18"
						cy="18"
						r={radius}
						fill="none"
						strokeWidth={strokeWidth}
						className={cn("transition-all duration-500", trackColor)}
					/>
					<circle
						cx="18"
						cy="18"
						r={radius}
						fill="none"
						strokeWidth={strokeWidth}
						className={cn("transition-all duration-500", strokeColor)}
						strokeDasharray={circumference.toFixed(2)}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
					/>
				</svg>
				{Icon && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Icon
							className={cn("size-4 sm:size-4.5 text-primary", iconClassName)}
						/>
					</div>
				)}
			</div>
		);
	},
);

CircularProgress.displayName = "CircularProgress";

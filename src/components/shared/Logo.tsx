import { Link } from "react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SITE_NAME = "Luna Moments";

const Logo = ({
	shadow = false,
	className,
	showName = false,
	frame = true,
	frameClassName,
}: {
	shadow?: boolean;
	className?: string;
	showName?: boolean;
	frame?: boolean;
	frameClassName?: string;
}) => {
	const logoUrl = `/logo.svg`;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex min-w-0 items-center gap-2"
		>
			<Link
				to="/"
				className={cn(
					"relative flex min-w-0 items-center gap-2.5 rounded-lg",
					className,
				)}
			>
				{shadow && (
					<div className="absolute inset-0 rounded-full bg-white/50 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-80" />
				)}
				<span
					className={cn(
						"relative z-10 flex h-10 w-[min(100%,11rem)] shrink-0 items-center justify-center sm:h-11 sm:w-[min(100%,12.5rem)]",
						frame &&
							cn(
								"rounded-lg bg-white px-1.5 py-1",
								frameClassName,
							),
					)}
				>
					<img
						src={logoUrl}
						alt={SITE_NAME}
						className="size-full object-contain object-center"
					/>
				</span>
				{showName ? (
					<span className="relative z-10 truncate text-base font-semibold tracking-tight text-foreground">
						{SITE_NAME}
					</span>
				) : null}
			</Link>
		</motion.div>
	);
};

export default Logo;

import { Button } from "@/components/ui/button";
import { adminNavItems, type NavItem } from "@/data/sidebar-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";
import Logo from "../shared/Logo";

const expandActiveClass =
	"bg-primary/10 text-primary font-bold rounded-sm py-3";
const notActiveClass =
	"text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm";
const activeClass = "bg-primary/10 font-bold text-primary rounded-sm";

export function DashboardSidebar({
	setCollapsed,
	collapsed,
}: {
	setCollapsed: (collapsed: boolean) => void;
	collapsed: boolean;
}) {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const isMobile = useIsMobile(1024);

	const toggleExpanded = (title: string) => {
		setExpandedItems((prev) =>
			prev.includes(title)
				? prev.filter((item) => item !== title)
				: [...prev, title],
		);
	};

	const isActive = (href: string) => location.pathname === href;
	const isParentActive = (item: NavItem) => {
		if (isActive(item.href)) return true;
		return item.children?.some((child) => isActive(child.href)) ?? false;
	};

	return (
		<motion.aside
			initial={false}
			animate={{
				width: collapsed ? (isMobile ? 0 : 70) : 260,
				opacity: collapsed ? (isMobile ? 0 : 1) : 1,
			}}
			transition={{ duration: 0.3, ease: "easeInOut" }}
			className={cn(
				"fixed border-e inset-s-0 xl:inset-s-4 z-40 bg-card xl:rounded-3xl overflow-hidden flex flex-col transition-all duration-300 top-0 xl:top-4 h-full xl:h-[95%]",
			)}
		>
			{/* Logo */}
			<div
				className={`flex mt-4 items-center justify-between px-4 gap-2 ${collapsed ? "flex-col-reverse" : "flex-row"}`}
			>
				{!collapsed && <Logo className="min-w-0 flex-1" />}
				<Button
					variant="outline"
					size="icon"
					onClick={() => setCollapsed(!collapsed)}
					className="border-primary text-primary rounded-full md:size-10"
				>
					{collapsed ? (
						<ChevronRight className="size-4 rtl:rotate-180" />
					) : (
						<ChevronLeft className="size-4 rtl:rotate-180" />
					)}
				</Button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-4 px-3">
				<ul className="space-y-1">
					{adminNavItems.map((item) => (
						<li key={item.title}>
							{item.children ? (
								<div>
									<button
										onClick={() => {
											toggleExpanded(item.title);
											navigate(item.href);
										}}
										className={cn(
											"w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all",
											isParentActive(item) ? expandActiveClass : notActiveClass,
										)}
									>
										<item.icon className="size-5 shrink-0" />
										{!collapsed && (
											<>
												<span className="flex-1 text-start">
													{t(`sidebar.${item.title}`)}
												</span>
												<ChevronDown
													className={cn(
														"size-4 transition-transform",
														expandedItems.includes(item.title) && "rotate-180",
													)}
												/>
											</>
										)}
									</button>
									<AnimatePresence>
										{expandedItems.includes(item.title) && !collapsed && (
											<motion.ul
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.2 }}
												className="ms-6 mt-1 relative space-y-1 overflow-hidden"
											>
												<div className="w-0.75 h-full absolute inset-y-0 inset-s-0 bg-primary"></div>
												{item.children.map((child) => (
													<li key={child.title}>
														<Link
															to={child.href}
															onClick={() => {
																if (isMobile) {
																	setCollapsed(true);
																}
															}}
															className={cn(
																"flex items-center gap-2 px-3 py-2 ms-3 text-sm transition-all",
																isActive(child.href)
																	? activeClass
																	: notActiveClass,
															)}
														>
															<span className="size-1.5 rounded-full bg-current" />
															{t(`sidebar.${child.title}`)}
														</Link>
													</li>
												))}
											</motion.ul>
										)}
									</AnimatePresence>
								</div>
							) : (
								<Link
									to={item.href}
									onClick={() => {
										if (isMobile) {
											setCollapsed(true);
										}
									}}
									className={cn(
										"flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all",
										isActive(item.href) ? activeClass : notActiveClass,
									)}
								>
									<item.icon className="size-5 shrink-0" />
									{!collapsed && <span>{t(`sidebar.${item.title}`)}</span>}
								</Link>
							)}
						</li>
					))}
				</ul>
			</nav>
		</motion.aside>
	);
}

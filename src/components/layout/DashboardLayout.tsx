import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { useState } from "react";
import { Outlet } from "react-router";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DemoBanner } from "./DemoBanner";

export function DashboardLayout() {
	const isBelowLg = useIsMobile(1024);
	const [prevIsBelowLg, setPrevIsBelowLg] = useState(isBelowLg);
	const [collapsed, setCollapsed] = useState(isBelowLg);
	const [bannerDismissed, setBannerDismissed] = useState(false);

	if (isBelowLg !== prevIsBelowLg) {
		setPrevIsBelowLg(isBelowLg);
		setCollapsed(isBelowLg);
	}

	return (
		<div className="min-h-screen bg-background_new flex flex-col">
			<div className="flex-1 flex flex-col relative">
				<DashboardSidebar
					setCollapsed={setCollapsed}
					collapsed={collapsed}
				/>
				{!collapsed && isBelowLg && (
					<div
						className="fixed inset-0 bg-black/30 z-30"
						onClick={() => setCollapsed(true)}
					/>
				)}
				<div className="lg:p-3 flex-1 flex flex-col min-w-0">
					<div
						className={`${
							collapsed ? (isBelowLg ? "ms-0" : "ms-17.5") : "ms-0 lg:ms-67.5"
						} lg:rounded-xl overflow-hidden transition-all duration-300 flex-1 flex flex-col`}
					>
						<DashboardHeader onMenuClick={() => setCollapsed((prev) => !prev)} />

						{/* Demo Notification Banner moved inside content area */}
						{!bannerDismissed && (
							<div className="px-3 lg:px-6 pt-1 pb-2">
								<DemoBanner onDismiss={() => setBannerDismissed(true)} />
							</div>
						)}

						<motion.main
							className="flex-1 p-3 lg:p-6 pb-6"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							onClick={() => isBelowLg && setCollapsed(true)}
						>
							<Outlet />
						</motion.main>
					</div>
				</div>
			</div>
		</div>
	);
}

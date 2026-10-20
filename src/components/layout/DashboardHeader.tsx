import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Bell, CheckCheck, LogOut, Menu, Moon, Search, Settings, Sun, UserCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const { user, logout } = useAuth();
	const [searchValue, setSearchValue] = useState("");

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const userInitials = user?.name
		? user.name.slice(0, 2).toUpperCase()
		: "AB";

	return (
		<header className="sticky top-0 z-30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 py-3 px-1">
			{/* Start: Mobile Menu Toggle & Search & Guest Badge */}
			<div className="flex items-center justify-between md:justify-start flex-1 gap-2">
				<Button
					variant="outline"
					size="icon"
					className="lg:hidden shrink-0"
					onClick={onMenuClick}
				>
					<Menu className="size-5" />
				</Button>

				{/* Search Input Box */}
				<div className="relative flex w-full max-w-xs md:max-w-sm items-center gap-2">
					<Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
					<Input
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						placeholder={t("common.search")}
						className="w-full ps-9"
					/>
				</div>
			</div>

			{/* End: Actions (Language, Theme, Notifications, User) */}
			<div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
				{/* Language Switcher Dropdown */}
				<LanguageSwitcher />

				{/* Theme Toggle Button */}
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleTheme}
					title={
						theme === "light" ? t("settings.darkMode") : t("settings.lightMode")
					}
				>
					{theme === "light" ? (
						<Moon className="size-5" />
					) : (
						<Sun className="size-5 text-amber-500" />
					)}
				</Button>

				{/* Notifications Dropdown */}
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="relative group"
							title={t("notifications.title")}
						>
							<Bell className="size-5 transition-transform group-hover:scale-110" />
							<span className="absolute -top-1 -inset-e-1 size-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
								3
							</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-80">
						<div className="p-2 flex w-full items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="font-bold text-sm">
									{t("notifications.title")}
								</span>
								<span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px] font-semibold">
									{t("notifications.newCount")}
								</span>
							</div>
							<button
								type="button"
								className="h-7 px-2 text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 rounded-md hover:bg-muted"
								onClick={() => toast.success(t("notifications.allMarkedRead"))}
							>
								<CheckCheck className="size-3" />
								<span>{t("notifications.markAllRead")}</span>
							</button>
						</div>
						<DropdownMenuSeparator className="m-0" />
						<div className="max-h-75 divide-y divide-border/40 overflow-y-auto">
							<DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer bg-primary/5">
								<div className="flex items-center gap-2 w-full">
									<span className="font-medium text-sm text-foreground flex-1">
										{t("notifications.rsvpConfirmed")}
									</span>
									<span className="size-2 rounded-full bg-primary shrink-0" />
								</div>
								<span className="text-xs text-muted-foreground">
									{t("notifications.rsvpConfirmedDesc")}
								</span>
								<span className="text-[10px] text-muted-foreground/80 mt-0.5">
									{t("notifications.time10m")}
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
								<div className="flex items-center gap-2 w-full">
									<span className="font-medium text-sm text-muted-foreground flex-1">
										{t("notifications.tableReserved")}
									</span>
								</div>
								<span className="text-xs text-muted-foreground">
									{t("notifications.tableReservedDesc")}
								</span>
								<span className="text-[10px] text-muted-foreground/80 mt-0.5">
									{t("notifications.time2h")}
								</span>
							</DropdownMenuItem>
						</div>
						<DropdownMenuSeparator className="m-0" />
						<DropdownMenuItem asChild>
							<Link
								to="/notify-broadcasts"
								className="w-full h-10 justify-center text-primary font-semibold cursor-pointer text-center flex items-center"
							>
								{t("notifications.viewAll")}
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* User Profile Dropdown */}
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-3 p-1 md:ps-2 lg:ps-3 text-start bg-card rounded-md group/user cursor-pointer hover:bg-muted transition-all border border-border/40 outline-none"
						>
							<div className="flex-1 min-w-0 max-md:hidden">
								<p className="text-sm font-bold truncate text-foreground">
									{user?.name || t("auth.guestUser")}
								</p>
								<p className="text-xs truncate text-muted-foreground">
									{user?.email || "guest@luna.demo"}
								</p>
							</div>
							<Avatar className="size-9">
								<AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
									{userInitials}
								</AvatarFallback>
							</Avatar>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-bold leading-none">{user?.name || t("auth.guestUser")}</p>
								<p className="text-xs leading-none text-muted-foreground">
									{user?.email || "guest@luna.demo"}
								</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link to="/settings" className="flex items-center gap-2 cursor-pointer">
								<Settings className="size-4" />
								<span>{t("sidebar.settings")}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/login" className="flex items-center gap-2 cursor-pointer">
								<UserCheck className="size-4" />
								<span>{t("auth.loginTitle")}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleLogout}
							className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
						>
							<LogOut className="size-4" />
							<span>{t("auth.logout")}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

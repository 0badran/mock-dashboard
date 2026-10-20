import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/Logo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check, Copy, Moon, Sun } from "lucide-react";

const GUEST_EMAIL = "guest@luna.demo";
const GUEST_PASSWORD = "guest123";

export default function LoginPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const { loginWithCredentials } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !password) {
			toast.error(t("auth.invalidCredentials"));
			return;
		}

		setIsSubmitting(true);
		try {
			const success = await loginWithCredentials(email, password);
			if (success) {
				navigate("/");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCopy = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		toast.success(t("auth.copied"));
		setTimeout(() => setCopiedField(null), 2000);
	};

	return (
		<div className="relative min-h-screen bg-background_new flex flex-col justify-between overflow-x-hidden">
			{/* Top Bar with Language and Theme controls */}
			<header className="relative z-20 flex items-center justify-end px-4 sm:px-8 py-4 gap-2">
				<LanguageSwitcher />

				<Button
					variant="ghost"
					size="icon"
					onClick={toggleTheme}
					title={
						theme === "light"
							? t("settings.darkMode")
							: t("settings.lightMode")
					}
				>
					{theme === "light" ? (
						<Moon className="size-5" />
					) : (
						<Sun className="size-5 text-amber-500" />
					)}
				</Button>
			</header>

			{/* Main Form Area */}
			<main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
					className="w-full max-w-md"
				>
					<Card variant="auth">
						<CardHeader className="text-center space-y-3 pb-4">
							{/* Logo at the top without icons */}
							<div className="flex justify-center">
								<Logo />
							</div>

							<div className="space-y-1">
								<CardTitle className="text-2xl font-bold tracking-tight text-foreground justify-center">
									{t("auth.loginTitle")}
								</CardTitle>
								<CardDescription className="text-xs sm:text-sm text-muted-foreground">
									{t("auth.guestSubtitle")}
								</CardDescription>
							</div>
						</CardHeader>

						<CardContent className="space-y-6">
														{/* Guest Credentials Box for Copy & Paste ONLY */}
							<div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-3">
								<div className="space-y-0.5 text-start">
									<h3 className="text-xs font-bold text-foreground">
										{t("auth.guestCredentialsTitle")}
									</h3>
									<p className="text-[11px] text-muted-foreground leading-normal">
										{t("auth.guestCredentialsDesc")}
									</p>
								</div>

								<div className="space-y-2 pt-1">
									{/* Email Row */}
									<div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/60">
										<div className="min-w-0 text-start">
											<span className="block text-[10px] text-muted-foreground uppercase font-medium">
												{t("auth.email")}
											</span>
											<span className="text-xs font-mono font-semibold text-foreground select-all">
												{GUEST_EMAIL}
											</span>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												handleCopy(GUEST_EMAIL, "email")
											}
										>
											{copiedField === "email" ? (
												<Check className="size-3.5 text-success" />
											) : (
												<Copy className="size-3.5" />
											)}
											<span>
												{copiedField === "email"
													? t("auth.copied")
													: t("auth.copy")}
											</span>
										</Button>
									</div>

									{/* Password Row */}
									<div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/60">
										<div className="min-w-0 text-start">
											<span className="block text-[10px] text-muted-foreground uppercase font-medium">
												{t("auth.password")}
											</span>
											<span className="text-xs font-mono font-semibold text-foreground select-all">
												{GUEST_PASSWORD}
											</span>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												handleCopy(GUEST_PASSWORD, "password")
											}
										>
											{copiedField === "password" ? (
												<Check className="size-3.5 text-success" />
											) : (
												<Copy className="size-3.5" />
											)}
											<span>
												{copiedField === "password"
													? t("auth.copied")
													: t("auth.copy")}
											</span>
										</Button>
									</div>
								</div>
							</div>
							{/* Simple Clean Form without icons */}
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-1.5">
									<Label htmlFor="email">{t("auth.emailOrPhone")}</Label>
									<Input
										id="email"
										type="text"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="guest@luna.demo"
										required
										autoFocus
									/>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="password">{t("auth.password")}</Label>
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										required
									/>
								</div>

								<div className="pt-2">
									<Button
										type="submit"
										variant="default"
										size="lg"
										disabled={isSubmitting}
									>
										{isSubmitting
											? t("auth.signingIn")
											: t("auth.signIn")}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</motion.div>
			</main>

			{/* Minimal Footer */}
			<footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
				<p>Luna Moments &copy; {new Date().getFullYear()} - Event Operations</p>
			</footer>
		</div>
	);
}

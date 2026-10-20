import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
	align?: "start" | "center" | "end";
}

export function LanguageSwitcher({ align = "end" }: LanguageSwitcherProps) {
	const { t } = useTranslation();
	const { language, setLanguage } = useTheme();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					title={language === "ar" ? "العربية" : "English"}
				>
					<Globe className="size-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align={align}>
				<DropdownMenuLabel>{t("settings.language")}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => setLanguage("ar")}
					className="flex items-center justify-between cursor-pointer"
				>
					<span>عربي</span>
					{language === "ar" && <Check className="size-4 text-primary" />}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setLanguage("en")}
					className="flex items-center justify-between cursor-pointer"
				>
					<span>English</span>
					{language === "en" && <Check className="size-4 text-primary" />}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default LanguageSwitcher;

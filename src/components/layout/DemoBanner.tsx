import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DemoBannerProps {
	onDismiss?: () => void;
}

export function DemoBanner({ onDismiss }: DemoBannerProps) {
	const { t } = useTranslation();

	return (
		<div className="w-full bg-primary/10 border border-primary/20 rounded-2xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground flex items-center justify-between gap-3 shadow-xs">
			<div className="flex items-center gap-2 sm:gap-3 flex-wrap">
				<Badge variant="default">{t("common.guestMode")}</Badge>
				<p className="text-xs sm:text-sm text-muted-foreground leading-tight">
					{t("common.guestModeDesc")}
				</p>
			</div>

			{onDismiss && (
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={onDismiss}
					title={t("common.close")}
					className="shrink-0"
				>
					<X className="size-3.5" />
				</Button>
			)}
		</div>
	);
}

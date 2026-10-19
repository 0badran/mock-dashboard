import React from "react";
import { useTranslation } from "react-i18next";
import { MailOpen, Phone, Calendar, Utensils, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { RsvpItem } from "@/services/mockStorage";

interface RsvpDetailsDialogProps {
	rsvp: RsvpItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const RsvpDetailsDialog: React.FC<RsvpDetailsDialogProps> = ({
	rsvp,
	open,
	onOpenChange,
}) => {
	const { t, i18n } = useTranslation();

	if (!rsvp) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MailOpen className="size-5 text-primary" />
						{t("rsvps.rsvpDetails")}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div className="flex items-center gap-4 bg-primary/5 rounded-xl p-4">
						<div className="size-14 rounded-full bg-primary/10 text-primary border-2 border-background shadow-xs flex items-center justify-center text-xl font-bold uppercase shrink-0">
							{rsvp.guestName.trim().charAt(0)}
						</div>
						<div className="space-y-1 min-w-0">
							<h3 className="font-semibold text-lg text-foreground truncate">
								{rsvp.guestName}
							</h3>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Badge
									variant={
										rsvp.response === "attending"
											? "success"
											: rsvp.response === "declined"
												? "destructive"
												: "warning"
									}
								>
									{t(`rsvps.${rsvp.response}`)}
								</Badge>
								<span>•</span>
								<span>
									{rsvp.companions > 0
										? `+${rsvp.companions} ${t("rsvps.companionsCount")}`
										: t("rsvps.none")}
								</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
						<div className="p-3 rounded-lg border bg-muted/20 space-y-1">
							<span className="text-xs text-muted-foreground flex items-center gap-1.5">
								<Phone className="size-3.5" />
								{t("rsvps.phone")}
							</span>
							<p className="font-medium font-mono text-sm" dir="ltr">
								{rsvp.phone}
							</p>
						</div>

						<div className="p-3 rounded-lg border bg-muted/20 space-y-1">
							<span className="text-xs text-muted-foreground flex items-center gap-1.5">
								<Calendar className="size-3.5" />
								{t("rsvps.eventName")}
							</span>
							<p className="font-medium text-sm">{rsvp.eventName}</p>
						</div>

						<div className="p-3 rounded-lg border bg-muted/20 space-y-1">
							<span className="text-xs text-muted-foreground flex items-center gap-1.5">
								<Utensils className="size-3.5" />
								{t("rsvps.dietary")}
							</span>
							<p className="font-medium text-sm">{t(`rsvps.${rsvp.dietary}`)}</p>
						</div>

						<div className="p-3 rounded-lg border bg-muted/20 space-y-1">
							<span className="text-xs text-muted-foreground flex items-center gap-1.5">
								<Calendar className="size-3.5" />
								{t("guests.creationDate")}
							</span>
							<p className="font-medium text-sm">
								{formatDate(rsvp.createdAt, i18n.language)}
							</p>
						</div>
					</div>

					{rsvp.notes && (
						<div className="p-3 rounded-lg border bg-muted/20 space-y-1">
							<span className="text-xs text-muted-foreground flex items-center gap-1.5">
								<FileText className="size-3.5" />
								{t("rsvps.notes")}
							</span>
							<p className="text-sm text-foreground whitespace-pre-wrap">
								{rsvp.notes}
							</p>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto"
					>
						{t("common.close")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

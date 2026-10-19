import React from "react";
import { useTranslation } from "react-i18next";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { RsvpItem } from "@/services/mockStorage";

interface RsvpTableProps {
	rsvps: RsvpItem[];
	onSelectView: (rsvp: RsvpItem) => void;
	onSelectEdit: (rsvp: RsvpItem) => void;
	onDelete: (rsvp: RsvpItem) => void;
}

export const RsvpTable: React.FC<RsvpTableProps> = ({
	rsvps,
	onSelectView,
	onSelectEdit,
	onDelete,
}) => {
	const { t, i18n } = useTranslation();

	return (
		<div className="rounded-2xl border bg-card overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead>{t("rsvps.guestName")}</TableHead>
						<TableHead>{t("rsvps.eventName")}</TableHead>
						<TableHead className="text-center">{t("rsvps.response")}</TableHead>
						<TableHead className="text-center">{t("rsvps.companions")}</TableHead>
						<TableHead>{t("rsvps.dietary")}</TableHead>
						<TableHead>{t("guests.creationDate")}</TableHead>
						<TableHead className="w-30 text-end">{t("common.actions")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rsvps.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={7}
								className="h-24 text-center text-muted-foreground"
							>
								{t("common.noData")}
							</TableCell>
						</TableRow>
					) : (
						rsvps.map((rsvp) => {
							const firstLetter = rsvp.guestName
								? rsvp.guestName.trim().charAt(0)
								: "?";
							return (
								<TableRow
									key={rsvp.id}
									className="group hover:bg-muted/50 transition-colors cursor-pointer"
									onClick={() => onSelectView(rsvp)}
								>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar size="default">
												<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
													{firstLetter}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium text-sm text-foreground">
													{rsvp.guestName}
												</p>
												<p
													className="text-xs text-muted-foreground font-mono mt-0.5"
													dir="ltr"
												>
													{rsvp.phone}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="font-medium text-sm text-foreground">
										{rsvp.eventName}
									</TableCell>
									<TableCell className="text-center">
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
									</TableCell>
									<TableCell className="text-center font-medium text-sm">
										{rsvp.companions > 0 ? (
											<span className="text-primary font-semibold">
												+{rsvp.companions}
											</span>
										) : (
											<span className="text-muted-foreground">0</span>
										)}
									</TableCell>
									<TableCell>
										<Badge variant="secondary">
											{t(`rsvps.${rsvp.dietary}`)}
										</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{formatDate(rsvp.createdAt, i18n.language)}
									</TableCell>
									<TableCell
										className="text-end"
										onClick={(e) => e.stopPropagation()}
									>
										<div className="flex items-center justify-end gap-1">
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => onSelectView(rsvp)}
												title={t("rsvps.rsvpDetails")}
											>
												<Eye className="size-3.5 text-muted-foreground" />
											</Button>
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => onSelectEdit(rsvp)}
												title={t("rsvps.editRsvp")}
											>
												<Edit2 className="size-3.5 text-muted-foreground" />
											</Button>
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => onDelete(rsvp)}
												title={t("common.delete")}
											>
												<Trash2 className="size-3.5 text-rose-500" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		</div>
	);
};

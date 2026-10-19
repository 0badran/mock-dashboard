import React from "react";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import type { RsvpItem } from "@/services/mockStorage";

interface RsvpFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingRsvp: RsvpItem | null;
	formData: Omit<RsvpItem, "id">;
	onFormChange: (data: Omit<RsvpItem, "id">) => void;
	onSubmit: (e: React.FormEvent) => void;
}

export const RsvpFormDialog: React.FC<RsvpFormDialogProps> = ({
	open,
	onOpenChange,
	editingRsvp,
	formData,
	onFormChange,
	onSubmit,
}) => {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="size-5 text-primary" />
						{editingRsvp ? t("rsvps.editRsvp") : t("rsvps.addRsvp")}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4 py-2">
					<div>
						<Label>{t("rsvps.guestName")}</Label>
						<Input
							required
							value={formData.guestName}
							onChange={(e) =>
								onFormChange({ ...formData, guestName: e.target.value })
							}
							placeholder={t("rsvps.guestName")}
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<Label>{t("rsvps.phone")}</Label>
							<Input
								value={formData.phone}
								onChange={(e) =>
									onFormChange({ ...formData, phone: e.target.value })
								}
								dir="ltr"
							/>
						</div>
						<div>
							<Label>{t("rsvps.companions")}</Label>
							<Input
								type="number"
								min="0"
								value={formData.companions}
								onChange={(e) =>
									onFormChange({
										...formData,
										companions: Number(e.target.value),
									})
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<Label>{t("rsvps.response")}</Label>
							<Select
								value={formData.response}
								onValueChange={(val) =>
									onFormChange({
										...formData,
										response: val as RsvpItem["response"],
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="attending">
										{t("rsvps.attending")}
									</SelectItem>
									<SelectItem value="pending">
										{t("rsvps.pending")}
									</SelectItem>
									<SelectItem value="declined">
										{t("rsvps.declined")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>{t("rsvps.dietary")}</Label>
							<Select
								value={formData.dietary}
								onValueChange={(val) =>
									onFormChange({
										...formData,
										dietary: val as RsvpItem["dietary"],
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="regular">
										{t("rsvps.regular")}
									</SelectItem>
									<SelectItem value="vegetarian">
										{t("rsvps.vegetarian")}
									</SelectItem>
									<SelectItem value="none">{t("rsvps.none")}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div>
						<Label>{t("rsvps.notes")}</Label>
						<Input
							value={formData.notes}
							onChange={(e) =>
								onFormChange({ ...formData, notes: e.target.value })
							}
							placeholder={t("rsvps.notes")}
						/>
					</div>

					<DialogFooter className="gap-3 sm:gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{t("common.cancel")}
						</Button>
						<Button type="submit">
							{t("common.save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

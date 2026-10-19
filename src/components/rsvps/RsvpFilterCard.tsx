import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface RsvpFilterCardProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
	orderDirection: "desc" | "asc";
	onOrderDirectionChange: (value: "desc" | "asc") => void;
	orderBy: "created_at" | "name" | "phone" | "companions";
	onOrderByChange: (
		value: "created_at" | "name" | "phone" | "companions",
	) => void;
}

export const RsvpFilterCard: React.FC<RsvpFilterCardProps> = ({
	searchTerm,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	orderDirection,
	onOrderDirectionChange,
	orderBy,
	onOrderByChange,
}) => {
	const { t } = useTranslation();

	return (
		<Card className="rounded-2xl border bg-card">
			<CardContent className="p-4">
				<div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3">
					{/* Search Input */}
					<div className="flex-1 space-y-1.5">
						<Label variant="filter">{t("common.search")}</Label>
						<div className="relative">
							<Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
							<Input
								placeholder={t("rsvps.searchPlaceholder")}
								value={searchTerm}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pe-9"
							/>
						</div>
					</div>

					{/* Status Filter */}
					<div className="w-full lg:w-44 space-y-1.5">
						<Label variant="filter">{t("common.status")}</Label>
						<Select value={statusFilter} onValueChange={onStatusFilterChange}>
							<SelectTrigger>
								<SelectValue placeholder={t("rsvps.allResponses")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("rsvps.allResponses")}</SelectItem>
								<SelectItem value="attending">{t("rsvps.attending")}</SelectItem>
								<SelectItem value="pending">{t("rsvps.pending")}</SelectItem>
								<SelectItem value="declined">{t("rsvps.declined")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Order Direction */}
					<div className="w-full lg:w-36 space-y-1.5">
						<Label variant="filter">{t("guests.orderDirection")}</Label>
						<Select
							value={orderDirection}
							onValueChange={(val) =>
								onOrderDirectionChange(val as "desc" | "asc")
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("guests.desc")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="desc">{t("guests.desc")}</SelectItem>
								<SelectItem value="asc">{t("guests.asc")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Order By */}
					<div className="w-full lg:w-40 space-y-1.5">
						<Label variant="filter">{t("guests.orderBy")}</Label>
						<Select
							value={orderBy}
							onValueChange={(val) =>
								onOrderByChange(
									val as "created_at" | "name" | "phone" | "companions",
								)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("guests.creationDate")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="created_at">
									{t("guests.creationDate")}
								</SelectItem>
								<SelectItem value="name">{t("guests.name")}</SelectItem>
								<SelectItem value="phone">{t("guests.phone")}</SelectItem>
								<SelectItem value="companions">
									{t("rsvps.companions")}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

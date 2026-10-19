import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	Mails,
	Plus,
	Search,
	Eye,
	Edit2,
	Trash2,
	Calendar,
	Heart,
	FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
	useMockCollection,
	type InvitationTemplateItem,
	type LookupItem,
} from "@/services/mockStorage";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function InvitationsPage() {
	const { t } = useTranslation();
	const {
		data: templates,
		add,
		update,
		remove,
	} = useMockCollection<InvitationTemplateItem>("invitations");
	const { data: lookups } = useMockCollection<LookupItem>("lookups");

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] =
		useState<InvitationTemplateItem | null>(null);
	const [previewModalOpen, setPreviewModalOpen] = useState(false);
	const [previewTemplate, setPreviewTemplate] =
		useState<InvitationTemplateItem | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<InvitationTemplateItem | null>(null);

	const eventTypes = useMemo(() => {
		return lookups.filter((item) => item.category === "أنواع المناسبات");
	}, [lookups]);

	const categoryTabs = useMemo(() => {
		return [
			{ label: t("invitations.allTemplates"), value: "all" },
			...eventTypes.map((et) => ({
				label: et.value,
				value: et.value,
			})),
		];
	}, [eventTypes, t]);

	const [formData, setFormData] = useState<Omit<InvitationTemplateItem, "id">>({
		templateName: "",
		templateSlug: "",
		brideName: "",
		groomName: "",
		eventDate: "2026-11-20",
		isPublished: true,
		coverUrl: "",
		previewUrl: "",
		eventTypeName: "حفل زفاف",
	});

	const filteredTemplates = useMemo(() => {
		return templates.filter((tpl) => {
			const query = searchTerm.toLowerCase();
			const matchesSearch =
				tpl.templateName.toLowerCase().includes(query) ||
				tpl.templateSlug.toLowerCase().includes(query) ||
				(tpl.brideName && tpl.brideName.toLowerCase().includes(query)) ||
				(tpl.groomName && tpl.groomName.toLowerCase().includes(query)) ||
				(tpl.eventTypeName && tpl.eventTypeName.toLowerCase().includes(query));

			const itemCategory = tpl.eventTypeName || "حفل زفاف";
			const matchesCategory =
				selectedCategory === "all" ||
				itemCategory === selectedCategory;

			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "published" && tpl.isPublished) ||
				(statusFilter === "draft" && !tpl.isPublished);

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [templates, searchTerm, selectedCategory, statusFilter]);

	const handleOpenCreate = () => {
		setEditingTemplate(null);
		setFormData({
			templateName: "",
			templateSlug: `template-${templates.length + 1}`,
			brideName: "",
			groomName: "",
			eventDate: new Date().toISOString().split("T")[0],
			isPublished: true,
			eventTypeName: eventTypes[0]?.value || "حفل زفاف",
			coverUrl:
				"https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
			previewUrl: "",
		});
		setModalOpen(true);
	};

	const handleOpenEdit = (tpl: InvitationTemplateItem) => {
		setEditingTemplate(tpl);
		setFormData({
			templateName: tpl.templateName,
			templateSlug: tpl.templateSlug,
			brideName: tpl.brideName,
			groomName: tpl.groomName,
			eventDate: tpl.eventDate,
			isPublished: tpl.isPublished,
			eventTypeName: tpl.eventTypeName || eventTypes[0]?.value || "حفل زفاف",
			coverUrl: tpl.coverUrl || "",
			previewUrl: tpl.previewUrl || "",
		});
		setModalOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.templateName.trim()) return;

		if (editingTemplate) {
			update(editingTemplate.id, formData);
			toast.success(t("common.itemUpdated"));
		} else {
			add(formData);
			toast.success(t("common.itemCreated"));
		}
		setModalOpen(false);
	};

	const handleDeletePrompt = (tpl: InvitationTemplateItem) => {
		setTemplateToDelete(tpl);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!templateToDelete) return;
		remove(templateToDelete.id);
		toast.success(t("common.itemDeleted"));
		setDeleteConfirmOpen(false);
		setTemplateToDelete(null);
	};

	const handlePreview = (tpl: InvitationTemplateItem) => {
		setPreviewTemplate(tpl);
		setPreviewModalOpen(true);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<Mails className="size-6" />
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold tracking-tight">
							{t("sidebar.invitations_templates")}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t("invitations.subtitle")}
						</p>
					</div>
				</div>

				<Button onClick={handleOpenCreate} className="gap-2">
					<Plus className="size-4" />
					<span>{t("invitations.addTemplate")}</span>
				</Button>
			</div>

			{/* Category tabs */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none"
			>
				{categoryTabs.map((tab) => (
					<button
						key={tab.value}
						type="button"
						onClick={() => setSelectedCategory(tab.value)}
						className={`px-4 py-2 text-sm font-medium transition-all rounded-full whitespace-nowrap border cursor-pointer ${
							selectedCategory === tab.value
								? "bg-primary text-primary-foreground border-primary shadow-sm"
								: "bg-card hover:bg-muted border-border text-muted-foreground"
						}`}
					>
						{tab.label}
					</button>
				))}
			</motion.div>

			{/* Search & Filters Card */}
			<Card className="rounded-2xl">
				<CardContent className="p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
					<div className="flex-1 block relative mt-auto">
						<div className="h-fit mt-auto space-y-1.5">
							<Label variant="filter">{t("common.search")}</Label>
							<div className="relative">
								<Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
								<Input
									placeholder={t("invitations.searchPlaceholder")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="ps-9"
								/>
							</div>
						</div>
					</div>

					<div className="w-full md:w-56 space-y-1.5">
						<Label variant="filter">{t("invitations.eventType")}</Label>
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={t("invitations.allTemplates")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("invitations.allTemplates")}</SelectItem>
								{eventTypes.map((et) => (
									<SelectItem key={et.id} value={et.value}>
										{et.value}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="w-full md:w-56 space-y-1.5">
						<Label variant="filter">{t("invitations.publishedStatus")}</Label>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={t("common.all")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("common.all")}</SelectItem>
								<SelectItem value="published">
									{t("invitations.published")}
								</SelectItem>
								<SelectItem value="draft">
									{t("invitations.draft")}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Templates Grid */}
			{filteredTemplates.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 rounded-2xl border border-dashed bg-card">
					<Mails className="size-12 opacity-30 text-primary" />
					<p className="text-sm font-semibold">
						{t("invitations.noTemplatesFound")}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					<AnimatePresence mode="popLayout">
						{filteredTemplates.map((tpl, index) => (
							<motion.div
								key={tpl.id}
								layout
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: 0.03 * index, duration: 0.25 }}
								className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
							>
								{/* Cover Preview Image */}
								<div className="relative aspect-6/7 w-full overflow-hidden bg-muted">
									{tpl.coverUrl ? (
										<img
											src={tpl.coverUrl}
											alt={tpl.templateName}
											onError={(e) => {
												e.currentTarget.onerror = null;
												e.currentTarget.src =
													"https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop";
											}}
											className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
										/>
									) : (
										<div className="size-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/40 p-4">
											<FileText className="size-12 opacity-30" />
											<span className="text-xs font-mono">{tpl.templateSlug}</span>
										</div>
									)}

									{/* Badges Overlay */}
									<div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
										<Badge
											variant={tpl.isPublished ? "success" : "secondary"}
											className="shadow-sm font-semibold pointer-events-auto"
										>
											{tpl.isPublished
												? t("invitations.published")
												: t("invitations.draft")}
										</Badge>
										<span className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-mono font-bold pointer-events-auto">
											{tpl.templateSlug}
										</span>
									</div>
								</div>

								{/* Details Info */}
								<div className="p-4 flex flex-col flex-1 justify-between gap-3">
									<div className="space-y-1.5">
										<h3 className="font-bold text-base text-foreground leading-tight line-clamp-1">
											{tpl.templateName}
										</h3>
										{(tpl.brideName || tpl.groomName) && (
											<p className="flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
												<Heart className="size-3 text-rose-500 shrink-0" />
												<span>
													{[tpl.brideName, tpl.groomName]
														.filter(Boolean)
														.join(" & ")}
												</span>
											</p>
										)}
										{tpl.eventTypeName && (
											<p className="text-[11px] font-medium text-primary">
												{tpl.eventTypeName}
											</p>
										)}
										{tpl.eventDate && (
											<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<Calendar className="size-3 text-muted-foreground shrink-0" />
												<span>{tpl.eventDate}</span>
											</p>
										)}
									</div>

									{/* Actions */}
									<div className="flex items-center justify-between pt-2 border-t border-border/50">
										<Button
											variant="outline"
											size="xs"
											onClick={() => handlePreview(tpl)}
											className="gap-1.5 text-xs text-primary hover:bg-primary/10"
										>
											<Eye className="size-3.5" />
											<span>{t("invitations.preview")}</span>
										</Button>

										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => handleOpenEdit(tpl)}
												title={t("common.edit")}
											>
												<Edit2 className="size-3.5 text-muted-foreground" />
											</Button>
											<Button
												variant="ghost"
												size="icon-xs"
												onClick={() => handleDeletePrompt(tpl)}
												title={t("common.delete")}
											>
												<Trash2 className="size-3.5 text-rose-500" />
											</Button>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}

			{/* Create / Edit Dialog */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Mails className="size-5 text-primary" />
							{editingTemplate
								? t("invitations.editTemplate")
								: t("invitations.addTemplate")}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4 py-2">
						<div>
							<Label>{t("invitations.templateName")}</Label>
							<Input
								required
								value={formData.templateName}
								onChange={(e) =>
									setFormData({ ...formData, templateName: e.target.value })
								}
								placeholder={t("invitations.templateName")}
							/>
						</div>

						<div>
							<Label>{t("invitations.templateSlug")}</Label>
							<Input
								required
								value={formData.templateSlug}
								onChange={(e) =>
									setFormData({ ...formData, templateSlug: e.target.value })
								}
								placeholder="e.g. royal-bloom"
								dir="ltr"
							/>
						</div>

						<div>
							<Label>{t("invitations.eventType")}</Label>
							<Select
								value={formData.eventTypeName}
								onValueChange={(val) =>
									setFormData({ ...formData, eventTypeName: val })
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder={t("invitations.eventType")} />
								</SelectTrigger>
								<SelectContent>
									{eventTypes.map((et) => (
										<SelectItem key={et.id} value={et.value}>
											{et.value}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>{t("invitations.brideName")}</Label>
								<Input
									value={formData.brideName}
									onChange={(e) =>
										setFormData({ ...formData, brideName: e.target.value })
									}
									placeholder={t("invitations.brideName")}
								/>
							</div>
							<div>
								<Label>{t("invitations.groomName")}</Label>
								<Input
									value={formData.groomName}
									onChange={(e) =>
										setFormData({ ...formData, groomName: e.target.value })
									}
									placeholder={t("invitations.groomName")}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>{t("invitations.eventDate")}</Label>
								<Input
									type="date"
									value={formData.eventDate}
									onChange={(e) =>
										setFormData({ ...formData, eventDate: e.target.value })
									}
								/>
							</div>
							<div>
								<Label>{t("common.status")}</Label>
								<Select
									value={formData.isPublished ? "published" : "draft"}
									onValueChange={(val) =>
										setFormData({
											...formData,
											isPublished: val === "published",
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="published">
											{t("invitations.published")}
										</SelectItem>
										<SelectItem value="draft">
											{t("invitations.draft")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label>{t("invitations.coverUrl")}</Label>
							<Input
								value={formData.coverUrl}
								onChange={(e) =>
									setFormData({ ...formData, coverUrl: e.target.value })
								}
								placeholder="https://images.unsplash.com/..."
							/>
						</div>

						<DialogFooter className="gap-2 sm:gap-0 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setModalOpen(false)}
							>
								{t("common.cancel")}
							</Button>
							<Button type="submit">{t("common.save")}</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Template Digital Preview Modal */}
			<Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
				<DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-0 bg-transparent shadow-2xl">
					{previewTemplate && (
						<div className="relative overflow-hidden rounded-3xl bg-background border border-border shadow-2xl flex flex-col">
							{/* Card Header Image */}
							<div className="relative h-48 w-full bg-muted overflow-hidden">
								{previewTemplate.coverUrl && (
									<img
										src={previewTemplate.coverUrl}
										alt={previewTemplate.templateName}
										onError={(e) => {
											e.currentTarget.onerror = null;
											e.currentTarget.src =
												"https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop";
										}}
										className="size-full object-cover"
									/>
								)}
								<div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
								<div className="absolute top-3 inset-e-3">
									<Badge variant="outline" className="bg-background/80 backdrop-blur-sm font-mono text-[10px]">
										{previewTemplate.templateSlug}
									</Badge>
								</div>
							</div>

							{/* Card Body with Wedding Invitation Design */}
							<div className="p-6 text-center space-y-4 -mt-10 relative z-10">
								<div className="size-16 rounded-full mx-auto bg-primary text-white flex items-center justify-center shadow-lg border-4 border-background">
									<Heart className="size-7 fill-white" />
								</div>

								<div className="space-y-1">
									<p className="text-xs uppercase tracking-widest text-primary font-bold">
										{t("invitations.weddingInvitation")}
									</p>
									<h2 className="text-2xl font-black text-foreground">
										{previewTemplate.brideName} & {previewTemplate.groomName}
									</h2>
									<p className="text-xs text-muted-foreground">
										{previewTemplate.templateName}
									</p>
								</div>

								<div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1.5">
									<p className="font-semibold text-foreground">
										{t("invitations.invitationWelcomeMsg")}
									</p>
									<p className="font-mono text-primary font-bold">
										📅 {previewTemplate.eventDate}
									</p>
									<p>📍 {t("invitations.sampleVenue")}</p>
								</div>

								<Button
									className="w-full rounded-xl gap-2 font-bold"
									onClick={() => setPreviewModalOpen(false)}
								>
									<span>{t("common.close")}</span>
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={deleteConfirmOpen}
				onOpenChange={setDeleteConfirmOpen}
				onConfirm={handleConfirmDelete}
				itemName={templateToDelete?.templateName}
			/>
		</div>
	);
}


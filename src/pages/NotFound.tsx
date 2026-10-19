import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="p-4 rounded-full bg-primary/10 text-primary">
        <AlertCircle className="size-10" />
      </div>
      <h1 className="text-2xl font-bold">{t("notFound.title")}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t("notFound.subtitle")}
      </p>
      <Button asChild>
        <Link to="/" className="gap-2">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          <span>{t("notFound.backHome")}</span>
        </Link>
      </Button>
    </div>
  );
}

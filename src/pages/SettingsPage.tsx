import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Moon, Sun, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = useTheme();

  const [siteName, setSiteName] = useState("Luna Moments - لنظام الدعوات");
  const [supportEmail, setSupportEmail] = useState("support@luna.demo");

  const handleSaveGeneral = (e: FormEvent) => {
    e.preventDefault();
    toast.success(t("common.itemUpdated"));
  };


  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {/* Guest Mode & Storage Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="text-base">
              {t("settings.previewSettings")}
            </CardTitle>
          </div>
          <CardDescription>{t("settings.storageDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/50">
            <div>
              <p className="text-sm font-semibold">{t("settings.storageType")}</p>
              <p className="text-xs text-muted-foreground">
                HTML5 window.sessionStorage (Scoped to current browser tab)
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-xs font-mono">
              SESSION_STORAGE
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.themeMode")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="size-5 text-primary" />
              ) : (
                <Sun className="size-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium">{t("settings.themeMode")}</p>
                <p className="text-xs text-muted-foreground capitalize">{theme}</p>
              </div>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="text-xs">
              {t("common.toggleTheme")}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{t("settings.language")}</p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "العربية (RTL)" : "English (LTR)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant={language === "ar" ? "default" : "outline"}
                onClick={() => setLanguage("ar")}
                className="text-xs"
              >
                العربية
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                onClick={() => setLanguage("en")}
                className="text-xs"
              >
                English
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.generalSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div>
              <Label>{t("settings.siteName")}</Label>
              <Input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
            <div>
              <Label>{t("settings.supportEmail")}</Label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
            <div className="pt-2 flex justify-end">
              <Button type="submit">{t("settings.saveSettings")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

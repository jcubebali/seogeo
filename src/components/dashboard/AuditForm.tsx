import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Globe, Search, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditFormValues } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const auditSchema = z.object({
  url: z.string().url("Please enter a valid URL (e.g., https://example.com)"),
  competitors: z.array(z.object({
    url: z.string().url("Invalid competitor URL")
  })).max(4, "Max 4 competitors"),
});

export default function AuditForm({ onSubmit }: { onSubmit: (data: AuditFormValues) => void }) {
  const { t } = useLanguage();
  const { register, control, handleSubmit, formState: { errors } } = useForm<AuditFormValues>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      url: "",
      competitors: [{ url: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "competitors"
  });

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {t("heroTitle_1")} <span className="text-primary/40 underline decoration-primary/20 underline-offset-8">{t("heroTitle_2")}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          {t("heroSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#27272a] bg-[#18181b] shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">{t("startAnalysis")}</CardTitle>
              <CardDescription className="text-zinc-400">{t("enterUrlAndComp")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="audit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    {t("targetUrlLabel")}
                  </label>
                  <div className="relative group">
                    <Input 
                      {...register("url")} 
                      placeholder={t("targetUrlPlaceholder")} 
                      className={`h-12 bg-[#09090b] border-[#27272a] text-lg transition-all ${errors.url ? "border-destructive ring-destructive/10" : "focus:border-blue-500"}`}
                    />
                    {errors.url && (
                      <p className="text-sm text-destructive mt-1.5 font-medium">{errors.url.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3" />
                      {t("competitorsLabel")}
                    </label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => append({ url: "" })}
                      disabled={fields.length >= 4}
                      className="h-8 border-[#27272a] bg-zinc-800/50 hover:bg-zinc-800 border-dashed"
                    >
                      <Plus className="h-3 w-3 mr-1" /> {t("addCompetitor")}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex-1">
                          <Input 
                            {...register(`competitors.${index}.url`)} 
                            placeholder={`${t("competitorPlaceholder")} ${index + 1}`}
                            className={`h-10 bg-[#09090b] border-[#27272a] transition-all ${errors.competitors?.[index]?.url ? "border-destructive" : "focus:border-blue-500"}`}
                          />
                          {errors.competitors?.[index]?.url && (
                            <p className="text-xs text-destructive mt-1 font-medium">{errors.competitors[index]?.url?.message}</p>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => remove(index)}
                          className="h-10 w-10 text-zinc-500 hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-[#09090b]/50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#27272a] w-full">
              <p className="text-xs text-zinc-500 font-medium flex items-center gap-2 uppercase tracking-tight">
                <Zap className="h-3 w-3 text-blue-500 fill-blue-500" />
                {t("engineAudit")}
              </p>
              <Button type="submit" form="audit-form" size="lg" className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold group">
                {t("runFullAudit")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wider">
                <Zap className="h-4 w-4" /> {t("geoEngine")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm opacity-90 leading-relaxed font-medium">
              <p>{t("geoEngineDesc")}</p>
              <ul className="space-y-3">
                <li className="flex gap-3 items-center">
                  <div className="h-6 w-6 shrink-0 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-bold">01</div>
                  <span>{t("eeatSignals")}</span>
                </li>
                <li className="flex gap-3 items-center">
                  <div className="h-6 w-6 shrink-0 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-bold">02</div>
                  <span>{t("citationPotential")}</span>
                </li>
                <li className="flex gap-3 items-center">
                  <div className="h-6 w-6 shrink-0 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-bold">03</div>
                  <span>{t("contentStructure")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl border border-[#27272a] bg-[#18181b] flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-[#27272a]">
              <Search className="h-6 w-6 text-zinc-500" />
            </div>
            <h4 className="font-bold text-zinc-300">{t("localSeoTitle")}</h4>
            <p className="text-[11px] text-zinc-500 px-4 leading-relaxed font-medium uppercase tracking-tighter">{t("localSeoDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

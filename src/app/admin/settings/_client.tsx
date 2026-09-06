"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Info, Globe } from "lucide-react";
import { upsertSettingsBatch } from "@/actions/settings";
import { toast } from "sonner";

interface Props {
  initialSettings: Record<string, string>;
}

export default function AdminSettingsClient({ initialSettings }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name:     initialSettings.company_name     ?? "",
    tagline:          initialSettings.tagline           ?? "",
    description:      initialSettings.description       ?? "",
    email:            initialSettings.email             ?? "",
    phone:            initialSettings.phone             ?? "",
    address:          initialSettings.address           ?? "",
    whatsapp:         initialSettings.whatsapp          ?? "",
    meta_title:       initialSettings.meta_title        ?? "",
    meta_description: initialSettings.meta_description  ?? "",
    linkedin_url:     initialSettings.linkedin_url      ?? "",
    twitter_url:      initialSettings.twitter_url       ?? "",
    facebook_url:     initialSettings.facebook_url      ?? "",
    instagram_url:    initialSettings.instagram_url     ?? "",
  });

  const field = (key: keyof typeof settings) => ({
    value: settings[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSettings((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const handleSave = async (
    e: React.FormEvent,
    category: "general" | "contact" | "seo" | "social"
  ) => {
    e.preventDefault();
    setIsSaving(true);

    const categoryFields: Record<string, "general" | "contact" | "seo" | "social"> = {
      company_name:     "general",
      tagline:          "general",
      description:      "general",
      email:            "contact",
      phone:            "contact",
      address:          "contact",
      whatsapp:         "contact",
      meta_title:       "seo",
      meta_description: "seo",
      linkedin_url:     "social",
      twitter_url:      "social",
      facebook_url:     "social",
      instagram_url:    "social",
    };

    const settingsToSave = Object.entries(settings)
      .filter(([key]) => categoryFields[key] === category)
      .map(([key, value]) => ({ key, value, category }));

    try {
      const result = await upsertSettingsBatch(settingsToSave);
      if (result.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(result.error ?? "Failed to save settings.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8 text-left max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-dark">
          Portal Configurations
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Update core metadata, contact values, SEO structures, and social links.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-surface border border-border/80 p-1.5 rounded-xl mb-6 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="rounded-lg py-2.5 font-heading font-semibold text-xs sm:text-sm">General</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg py-2.5 font-heading font-semibold text-xs sm:text-sm">Contact Details</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg py-2.5 font-heading font-semibold text-xs sm:text-sm">SEO Meta</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg py-2.5 font-heading font-semibold text-xs sm:text-sm">Social Links</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <form onSubmit={(e) => handleSave(e, "general")}>
            <Card className="border border-border/80 bg-card rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-foreground">General Settings</h3>
                <p className="text-muted-foreground text-xs">Update the primary company name and branding description.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company_name" className="text-xs font-semibold text-foreground">Company Name</Label>
                  <Input id="company_name" {...field("company_name")} className="bg-surface/50 border-border/80 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tagline" className="text-xs font-semibold text-foreground">Company Tagline</Label>
                  <Input id="tagline" {...field("tagline")} className="bg-surface/50 border-border/80 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold text-foreground">Company Overview</Label>
                  <Textarea id="description" rows={4} {...field("description")} className="bg-surface/50 border-border/80 rounded-xl resize-none leading-relaxed" />
                </div>
              </div>
              <SaveButton label="Save General Settings" isSaving={isSaving} />
            </Card>
          </form>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <form onSubmit={(e) => handleSave(e, "contact")}>
            <Card className="border border-border/80 bg-card rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-foreground">Contact Information</h3>
                <p className="text-muted-foreground text-xs">Manage phone numbers, emails, addresses shown in the footer and contact pages.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground">Support Email</Label>
                  <Input id="email" type="email" {...field("email")} className="bg-surface/50 border-border/80 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">Support Phone</Label>
                  <Input id="phone" {...field("phone")} className="bg-surface/50 border-border/80 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-xs font-semibold text-foreground">WhatsApp Number</Label>
                  <Input id="whatsapp" {...field("whatsapp")} className="bg-surface/50 border-border/80 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold text-foreground">Office Address</Label>
                  <Input id="address" {...field("address")} className="bg-surface/50 border-border/80 rounded-xl" />
                </div>
              </div>
              <SaveButton label="Save Contact Details" isSaving={isSaving} />
            </Card>
          </form>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <form onSubmit={(e) => handleSave(e, "seo")}>
            <Card className="border border-border/80 bg-card rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-foreground">SEO Metatags</h3>
                <p className="text-muted-foreground text-xs">Configure how search engines index your pages.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="meta_title" className="text-xs font-semibold text-foreground">Meta Title</Label>
                  <Input id="meta_title" {...field("meta_title")} className="bg-surface/50 border-border/80 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meta_description" className="text-xs font-semibold text-foreground">Meta Description</Label>
                  <Textarea id="meta_description" rows={3} {...field("meta_description")} className="bg-surface/50 border-border/80 rounded-xl resize-none leading-relaxed" />
                </div>
              </div>
              <SaveButton label="Save SEO Settings" isSaving={isSaving} />
            </Card>
          </form>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social">
          <form onSubmit={(e) => handleSave(e, "social")}>
            <Card className="border border-border/80 bg-card rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-foreground">Social Media Links</h3>
                <p className="text-muted-foreground text-xs">Update your social media profile URLs shown in the footer.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(["linkedin_url", "twitter_url", "facebook_url", "instagram_url"] as const).map((key) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key} className="text-xs font-semibold text-dark-800 capitalize">
                      {key.replace("_url", "").charAt(0).toUpperCase() + key.replace("_url", "").slice(1)} URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id={key} {...field(key)} placeholder="https://" className="pl-10 bg-surface/50 border-border/80 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border/60 flex items-start gap-3.5">
                <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use full URLs including <code className="font-mono">https://</code>. These appear in the website footer and contact sections.
                </p>
              </div>
              <SaveButton label="Save Social Links" isSaving={isSaving} />
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const SaveButton = ({ label, isSaving }: { label: string; isSaving: boolean }) => (
  <div className="pt-4 border-t border-border/50 flex justify-end">
    <Button type="submit" disabled={isSaving} size="lg" className="flex items-center gap-2 shadow-md">
      {isSaving ? (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      <span>{label}</span>
    </Button>
  </div>
);

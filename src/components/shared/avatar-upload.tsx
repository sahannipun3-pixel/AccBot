"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string;
  onUploadSuccess: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, displayName, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");
      formData.append("updateAvatar", "true");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed.");
      }

      setPreview(data.url);
      onUploadSuccess(data.url);
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo. Please try again.");
      setPreview(currentAvatarUrl); // revert preview
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative inline-block mx-auto mb-4 group">
      <Avatar className="h-24 w-24 border-2 border-gold shadow-md">
        <AvatarImage src={preview || undefined} alt={displayName} />
        <AvatarFallback className="bg-gold/15 text-gold font-bold text-2xl border border-gold/30">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Upload Overlay */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "absolute inset-0 rounded-full bg-dark/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer",
          uploading && "opacity-100 cursor-not-allowed"
        )}
        title="Upload profile photo"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : (
          <Camera className="h-6 w-6 text-white" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload profile photo"
      />
    </div>
  );
}

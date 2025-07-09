/* eslint-disable @next/next/no-img-element */
"use client";

import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Upload, X } from "lucide-react";
import { useS3Upload } from "next-s3-upload";
import { useState, useEffect } from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "pt", name: "Portuguese" },
];

const models = [
  {
    value: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
    label: "Llama 3.2 11B",
  },
  {
    value: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
    label: "Llama 3.2 90B",
  },
];

const lengths = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

// Color palette for dynamic theming
const colorPalette = [
  "hsl(262, 80%, 60%)",  // Purple
  "hsl(190, 80%, 60%)",  // Teal
  "hsl(336, 80%, 60%)",  // Pink
  "hsl(36, 100%, 65%)",  // Orange
  "hsl(172, 80%, 50%)",  // Mint
];

export default function Page() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<
    { language: string; description: string }[]
  >([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [model, setModel] = useState(models[0].value);
  const [length, setLength] = useState(lengths[0].value);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const { uploadToS3 } = useS3Upload();

  // Cycle through colors
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colorPalette.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentColor = colorPalette[currentColorIndex];

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const { url } = await uploadToS3(file);
    setImage(url);
  };

  const handleSubmit = async () => {
    if (!image || selectedLanguages.length === 0) return;

    setStatus("loading");

    const response = await fetch("/api/generateDescriptions", {
      method: "POST",
      body: JSON.stringify({
        languages: selectedLanguages,
        imageUrl: image,
        model,
        length,
      }),
    });

    const descriptions = await response.json();
    setDescriptions(descriptions);
    setStatus("success");
  };

  return (
    <div 
      className="mx-auto my-12 grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-2"
      style={{
        '--primary-color': currentColor,
        '--primary-light': currentColor.replace('60%)', '90%)'),
        '--primary-dark': currentColor.replace('60%)', '40%)'),
      } as React.CSSProperties}
    >
      <Card className="animated-card mx-auto w-full max-w-xl overflow-hidden p-0">
        <div className="gradient-header h-2 w-full"></div>
        <div className="p-6">
          <h2 className="mb-1 text-center text-2xl font-bold">
            Product Description Generator
          </h2>
          <p className="mb-6 text-balance text-center text-sm text-muted-foreground">
            Upload an image of your product to generate descriptions in multiple
            languages.
          </p>
          
          <div>
            <div
              className={`${image ? "border-transparent" : "hover:border-primary"} my-4 flex aspect-[3] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-500`}
            >
              {image ? (
                <div className="relative flex h-full max-h-full w-full items-center justify-center">
                  <img
                    src={image}
                    alt="Uploaded product"
                    className="h-full rounded object-cover"
                  />
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute right-2 top-2 bg-white text-primary hover:bg-white/90"
                    onClick={() => setImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Label
                  htmlFor="image-upload"
                  className="flex w-full grow cursor-pointer items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-medium">Upload product image</span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, or WEBP
                    </span>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>
              )}
            </div>
            <div className={`${image ? "invisible" : ""} text-right`}>
              <button
                onClick={() =>
                  setImage(
                    "https://napkinsdev.s3.us-east-1.amazonaws.com/next-s3-uploads/91061dca-cebc-4215-ab2c-8bde6cb46cac/trader-wafer.JPG",
                  )
                }
                className="text-xs font-semibold text-primary hover:underline"
              >
                Use a sample image
              </button>
            </div>

            <div className="divide-y">
              <div className="grid grid-cols-2 py-7">
                <div>
                  <p className="text-sm font-bold">Model</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select the Llama 3.2 vision model you want to use.
                  </p>
                </div>
                <ToggleGroup
                  type="single"
                  className="mx-auto flex flex-wrap justify-start gap-2"
                  onValueChange={setModel}
                  value={model}
                >
                  {models.map((model) => (
                    <ToggleGroupItem
                      variant="outline"
                      key={model.value}
                      value={model.value}
                      className="rounded-full px-3 py-1 text-xs font-medium shadow-none transition-all data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      {model.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div className="grid grid-cols-2 py-7">
                <div>
                  <p className="text-sm font-bold">Languages</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose up to 3 languages for the product descriptions.
                  </p>
                </div>
                <ToggleGroup
                  type="multiple"
                  className="mx-auto flex flex-wrap justify-start gap-2"
                  onValueChange={setSelectedLanguages}
                >
                  {languages.map((lang) => (
                    <ToggleGroupItem
                      variant="outline"
                      key={lang.code}
                      value={lang.code}
                      disabled={
                        selectedLanguages.length === 3 &&
                        !selectedLanguages.includes(lang.code)
                      }
                      className="rounded-full px-3 py-1 text-xs font-medium shadow-none transition-all data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      {lang.name}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div className="grid grid-cols-2 py-7">
                <div>
                  <p className="text-sm font-bold">Length</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select the length of the product descriptions.
                  </p>
                </div>
                <ToggleGroup
                  type="single"
                  className="mx-auto flex flex-wrap justify-start gap-2"
                  onValueChange={setLength}
                  value={length}
                >
                  {lengths.map((model) => (
                    <ToggleGroupItem
                      variant="outline"
                      key={model.value}
                      value={model.value}
                      className="rounded-full px-3 py-1 text-xs font-medium shadow-none transition-all data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      {model.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className="mt-10 text-right">
              <Button
                onClick={handleSubmit}
                disabled={
                  !image || selectedLanguages.length === 0 || status === "loading"
                }
                className="relative overflow-hidden transition-all hover:shadow-lg"
                style={{
                  backgroundColor: currentColor,
                }}
              >
                <span
                  className={`${
                    status === "loading" ? "opacity-0" : "opacity-100"
                  } whitespace-pre-wrap text-center font-semibold leading-none tracking-tight text-white transition-opacity`}
                >
                  Generate descriptions
                </span>

                {status === "loading" && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <Spinner className="size-4 text-white" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {status === "idle" ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 lg:h-auto">
          <p className="text-center text-xl text-primary/50">
            See your generated descriptions here
          </p>
        </div>
      ) : (
        <Card className="animated-card mx-auto w-full max-w-xl overflow-hidden p-0">
          <div className="gradient-header h-2 w-full"></div>
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Generated Descriptions</h3>
              {status === "loading" ? (
                <div className="space-y-8">
                  {selectedLanguages.map((language) => (
                    <div className="flex flex-col space-y-3" key={language}>
                      <Skeleton className="h-8 w-[250px]" />
                      <Skeleton
                        className={`${
                          length === "short"
                            ? "h-12"
                            : length === "medium"
                              ? "h-20"
                              : "h-32"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {descriptions.map(({ language, description }) => (
                    <div key={language} className="mb-6 last:mb-0">
                      <div className="mb-2 flex items-center gap-2">
                        <div 
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: currentColor }}
                        ></div>
                        <h4 className="font-medium">
                          {languages.find((l) => l.code === language)?.name}
                        </h4>
                      </div>
                      <p className="rounded-lg bg-primary/5 p-4 text-sm">
                        {description}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .gradient-header {
          background: linear-gradient(
            90deg,
            var(--primary-color),
            var(--primary-light),
            var(--primary-dark),
            var(--primary-color)
          );
          background-size: 300% 100%;
          animation: gradient-shift 8s ease infinite;
        }

        .animated-card {
          transition: box-shadow 0.5s ease, transform 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .animated-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .text-primary {
          color: var(--primary-color);
        }

        .bg-primary {
          background-color: var(--primary-color);
        }

        .border-primary {
          border-color: var(--primary-color);
        }
      `}</style>
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Activity, CheckCircle2, Server, Database, BrainCircuit, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { AxiosError } from "axios";

interface AppSettings {
  aiProvider: string;
  aiModel: string;
  temperature: number;
  maxEmailLength: string;
  defaultTone: string;
  ctaStrength: string;
  autoGenerateEmails: boolean;
  enableScraping: boolean;
  enableHeuristics: boolean;
  autoEnrich: boolean;
  scrapeTimeout: number;
  lastConnectionStatus: "idle" | "connected" | "disconnected";
}

const defaultSettings: AppSettings = {
  aiProvider: "gemini",
  aiModel: "gemini-1.5-flash",
  temperature: 0.7,
  maxEmailLength: "medium",
  defaultTone: "professional",
  ctaStrength: "moderate",
  autoGenerateEmails: false,
  enableScraping: true,
  enableHeuristics: true,
  autoEnrich: false,
  scrapeTimeout: 30,
  lastConnectionStatus: "idle",
};

function normalizeLegacySettings(input: Partial<AppSettings>): Partial<AppSettings> {
  const normalized = { ...input };

  if (normalized.defaultTone === "friendly") {
    normalized.defaultTone = "casual";
  } else if (normalized.defaultTone === "direct") {
    normalized.defaultTone = "concise";
  }

  if (normalized.maxEmailLength === "detailed") {
    normalized.maxEmailLength = "long";
  }

  return normalized;
}

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("appSettings");
    if (!saved) {
      return defaultSettings;
    }

    const parsed = normalizeLegacySettings(JSON.parse(saved) as Partial<AppSettings>);
    return { ...defaultSettings, ...parsed };
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // Reset connection status if provider or model changes
      if (key === "aiProvider" || key === "aiModel") {
        next.lastConnectionStatus = "idle";
      }
      return next;
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    updateSetting("lastConnectionStatus", "idle");
    
    try {
      const response = await apiClient.post("/settings/test-ai", {
        provider: settings.aiProvider,
        model: settings.aiModel,
      });

      if (response.data.success) {
        updateSetting("lastConnectionStatus", "connected");
        toast.success(response.data.message || "AI Provider connection successful!");
      } else {
        updateSetting("lastConnectionStatus", "disconnected");
        toast.error(response.data.message || "Failed to connect to AI provider.");
      }
    } catch (error) {
      updateSetting("lastConnectionStatus", "disconnected");
      if (error instanceof AxiosError && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error instanceof Error) {
        toast.error(`Connection failed: ${error.message}`);
      } else {
        toast.error("Failed to connect to AI provider.");
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Manage AI models, enrichment behavior, and global workflow preferences.
        </p>
      </div>

      {/* System Status Card */}
      <Card className="border-muted bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Status
          </CardTitle>
          <CardDescription>Real-time operational status of core services</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-card border rounded-md p-3 shadow-sm">
            <Server className="h-5 w-5 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Backend API</span>
              <span className="text-xs text-muted-foreground">Operational</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
          </div>
          <div className="flex items-center gap-3 bg-card border rounded-md p-3 shadow-sm">
            <Database className="h-5 w-5 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Database</span>
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
          </div>
          <div className="flex items-center gap-3 bg-card border rounded-md p-3 shadow-sm">
            <BrainCircuit className="h-5 w-5 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">AI Service</span>
              <span className="text-xs text-muted-foreground">Responsive</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
          </div>
        </CardContent>
      </Card>

      {/* AI Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Provider Configuration</CardTitle>
          <CardDescription>
            Select and tune the language model used for data enrichment and cold email generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="aiProvider">Active AI Provider</Label>
              <Select
                value={settings.aiProvider}
                onValueChange={(value) => updateSetting("aiProvider", value)}
              >
                <SelectTrigger id="aiProvider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiModel">Active Model</Label>
              <Select
                value={settings.aiModel}
                onValueChange={(value) => updateSetting("aiModel", value)}
              >
                <SelectTrigger id="aiModel">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {settings.aiProvider === "gemini" && (
                    <>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                    </>
                  )}
                  {settings.aiProvider === "anthropic" && (
                    <>
                      <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    </>
                  )}
                  {settings.aiProvider === "groq" && (
                    <>
                      <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B</SelectItem>
                      <SelectItem value="llama-3.1-70b-versatile">Llama 3.1 70B</SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B</SelectItem>
                      <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                      <SelectItem value="gemma2-9b-it">Gemma 2 9B</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Temperature ({settings.temperature})</Label>
              <span className="text-xs text-muted-foreground">
                Higher values produce more creative outputs.
              </span>
            </div>
            <Slider
              value={[settings.temperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(vals) => updateSetting("temperature", vals[0])}
              className="py-1"
            />
          </div>

          <div className="space-y-2 max-w-sm">
            <Label htmlFor="maxEmailLength">Max Email Length</Label>
            <Select
              value={settings.maxEmailLength}
              onValueChange={(value) => updateSetting("maxEmailLength", value)}
            >
              <SelectTrigger id="maxEmailLength">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (&lt; 60 words)</SelectItem>
                <SelectItem value="medium">Medium (&lt; 120 words)</SelectItem>
                <SelectItem value="long">Long (&lt; 200 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm">
            Status:{" "}
            {settings.lastConnectionStatus === "connected" ? (
              <span className="text-emerald-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Connected</span>
            ) : settings.lastConnectionStatus === "disconnected" ? (
              <span className="text-destructive font-medium">Disconnected</span>
            ) : (
              <span className="text-muted-foreground font-medium">Idle</span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="w-[160px]"
          >
            {isTestingConnection ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Connection
          </Button>
        </CardFooter>
      </Card>

      {/* Email Generation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Email Generation Preferences</CardTitle>
          <CardDescription>
            Configure the default writing style and automation rules for outbound emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultTone">Default Tone</Label>
              <Select
                value={settings.defaultTone}
                onValueChange={(value) => updateSetting("defaultTone", value)}
              >
                <SelectTrigger id="defaultTone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaStrength">Call-To-Action Strength</Label>
              <Select
                value={settings.ctaStrength}
                onValueChange={(value) => updateSetting("ctaStrength", value)}
              >
                <SelectTrigger id="ctaStrength">
                  <SelectValue placeholder="Select CTA strength" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft">Soft (Open conversation)</SelectItem>
                  <SelectItem value="moderate">Moderate (Suggest a call)</SelectItem>
                  <SelectItem value="strong">Strong (Book a meeting)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Generate Emails</Label>
              <p className="text-sm text-muted-foreground">
                Automatically draft a cold email as soon as a lead is successfully enriched.
              </p>
            </div>
            <Switch
              checked={settings.autoGenerateEmails}
              onCheckedChange={(checked) => updateSetting("autoGenerateEmails", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enrichment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Enrichment Pipeline</CardTitle>
          <CardDescription>
            Tune how the system gathers data before handing it off to the AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Website Scraping</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the system to crawl the target company's domain for real-time context.
                </p>
              </div>
              <Switch
                checked={settings.enableScraping}
                onCheckedChange={(checked) => updateSetting("enableScraping", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fallback Heuristics</Label>
                <p className="text-sm text-muted-foreground">
                  Use search engine heuristics if direct scraping fails or is blocked.
                </p>
              </div>
              <Switch
                checked={settings.enableHeuristics}
                onCheckedChange={(checked) => updateSetting("enableHeuristics", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Enrich New Leads</Label>
                <p className="text-sm text-muted-foreground">
                  Trigger the enrichment pipeline immediately when a new lead is added.
                </p>
              </div>
              <Switch
                checked={settings.autoEnrich}
                onCheckedChange={(checked) => updateSetting("autoEnrich", checked)}
              />
            </div>
          </div>

          <div className="space-y-2 max-w-[200px] pt-2">
            <Label htmlFor="scrapeTimeout">Scrape Timeout (Seconds)</Label>
            <Input
              id="scrapeTimeout"
              type="number"
              min={10}
              max={120}
              value={settings.scrapeTimeout}
              onChange={(e) => updateSetting("scrapeTimeout", parseInt(e.target.value) || 30)}
            />
            <p className="text-xs text-muted-foreground mt-1">Maximum 120 seconds.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

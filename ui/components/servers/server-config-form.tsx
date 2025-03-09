import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfigSchema {
  type: string;
  properties: Record<
    string,
    {
      type: string;
      description?: string;
      required?: boolean;
    }
  >;
  required?: string[];
}

interface ServerConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: Record<string, any>) => void;
  configSchema: ConfigSchema;
  serverName: string;
}

export function ServerConfigForm({
  isOpen,
  onClose,
  onSubmit,
  configSchema,
  serverName,
}: ServerConfigFormProps) {
  const [config, setConfig] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const isRequired = (fieldName: string) => {
    return configSchema.required?.includes(fieldName) || false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {serverName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {Object.entries(configSchema.properties).map(([key, field]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {key}
                  {isRequired(key) && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={key}
                  type={field.type === "number" ? "number" : "text"}
                  placeholder={field.description}
                  value={config[key] || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      [key]:
                        field.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    }))
                  }
                  required={isRequired(key)}
                />
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Connect</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

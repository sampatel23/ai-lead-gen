import { Plus } from "lucide-react";
import { useState } from "react";
import { useCreateLead } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddLeadModalProps {
  /** Controlled open state — if provided, the trigger button is still rendered. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddLeadModal({ open, onOpenChange }: AddLeadModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    domain: "",
    contact_person: "",
  });

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const createLeadMutation = useCreateLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createLeadMutation.mutate(
      {
        company_name: formData.company_name,
        domain: formData.domain || undefined,
        contact_person: formData.contact_person || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setOpen(false);
            setFormData({ company_name: "", domain: "", contact_person: "" });
          }
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" id="add-lead-trigger-btn">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the company details. You can enrich it with AI after adding.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="grid gap-1.5">
              <Label htmlFor="add-company-name">Company Name</Label>
              <Input
                id="add-company-name"
                placeholder="e.g. Acme Corp"
                required
                autoFocus
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="add-domain">
                Domain{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="add-domain"
                placeholder="e.g. acme.com"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="add-contact">
                Contact Person{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="add-contact"
                placeholder="e.g. Jane Doe"
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createLeadMutation.isPending || !formData.company_name.trim()
              }
              id="submit-add-lead-btn"
            >
              {createLeadMutation.isPending ? "Creating…" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

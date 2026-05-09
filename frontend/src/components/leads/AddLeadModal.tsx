import { useState } from "react";
import { Plus } from "lucide-react";
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

export function AddLeadModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    domain: "",
    contact_person: "",
  });

  const createLeadMutation = useCreateLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createLeadMutation.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ company_name: "", domain: "", contact_person: "" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details of the company you want to track and enrich.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                placeholder="e.g. Acme Corp"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain (Optional)</Label>
              <Input
                id="domain"
                placeholder="e.g. acme.com"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_person">Contact Person (Optional)</Label>
              <Input
                id="contact_person"
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
            <Button type="submit" disabled={createLeadMutation.isPending}>
              {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

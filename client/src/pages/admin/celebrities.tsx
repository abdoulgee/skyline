import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, Plus, Edit, Trash2, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Celebrity } from "@shared/schema";

const categories = ["Actor", "Musician", "Athlete", "Influencer", "Comedian", "Model", "TV Host"];

export default function AdminCelebrities() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<Celebrity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Actor",
    priceUsd: "",
    imageUrl: "",
    bio: "",
  });

  const { data: celebrities, isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/admin/celebrities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      toast({ title: "Celebrity added successfully" });
      setIsAddOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to add celebrity", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/admin/celebrities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      toast({ title: "Celebrity updated successfully" });
      setEditingCelebrity(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update celebrity", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/celebrities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      toast({ title: "Celebrity deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete celebrity", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", category: "Actor", priceUsd: "", imageUrl: "", bio: "" });
  };

  const handleEdit = (celebrity: Celebrity) => {
    setEditingCelebrity(celebrity);
    setFormData({
      name: celebrity.name,
      category: celebrity.category,
      priceUsd: celebrity.priceUsd.toString(),
      imageUrl: celebrity.imageUrl || "",
      bio: celebrity.bio || "",
    });
  };

  const handleSubmit = () => {
    if (editingCelebrity) {
      updateMutation.mutate({ id: editingCelebrity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredCelebrities = celebrities?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const CelebrityForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Celebrity Name"
          data-testid="input-celebrity-name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Price (USD)</Label>
          <Input
            type="number"
            value={formData.priceUsd}
            onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
            placeholder="10000"
            data-testid="input-price"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
          data-testid="input-image-url"
        />
      </div>
      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Celebrity biography..."
          rows={4}
          data-testid="input-bio"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={createMutation.isPending || updateMutation.isPending}
        className="w-full"
        data-testid="button-save-celebrity"
      >
        {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Celebrity"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Manage Celebrities</h1>
              <p className="text-muted-foreground">Add, edit, and manage celebrity profiles.</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm} data-testid="button-add-celebrity">
                  <Plus className="h-4 w-4" />
                  Add Celebrity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Celebrity</DialogTitle>
                </DialogHeader>
                <CelebrityForm />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search celebrities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Celebrity</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : filteredCelebrities && filteredCelebrities.length > 0 ? (
                      filteredCelebrities.map((celebrity) => (
                        <TableRow key={celebrity.id} data-testid={`row-celebrity-${celebrity.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={celebrity.imageUrl || undefined} />
                                <AvatarFallback>{celebrity.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{celebrity.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {celebrity.bio || "No bio"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{celebrity.category}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-skyline-gold">
                            {formatPrice(celebrity.priceUsd)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={celebrity.status === "active" ? "default" : "secondary"}>
                              {celebrity.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog open={editingCelebrity?.id === celebrity.id} onOpenChange={(open) => !open && setEditingCelebrity(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(celebrity)} data-testid={`button-edit-${celebrity.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Celebrity</DialogTitle>
                                  </DialogHeader>
                                  <CelebrityForm />
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMutation.mutate(celebrity.id)}
                                data-testid={`button-delete-${celebrity.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No celebrities found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

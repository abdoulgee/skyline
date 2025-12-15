import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

const CelebrityForm = ({ onSubmit, initialData, isSubmitting }: any) => {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    category: "Actor",
    priceUsd: "",
    images: [], // Array of strings (urls)
    bio: "",
    isCampaignAvailable: false
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       setUploading(true);
       const uploadData = new FormData();
       for(let i=0; i<e.target.files.length; i++) {
         uploadData.append('images', e.target.files[i]);
       }
       
       try {
         const res = await fetch('/api/upload', {
           method: 'POST',
           body: uploadData
         });
         const data = await res.json();
         if(data.paths && data.paths.length > 0) {
            // Append new images to existing list
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...data.paths]
            }));
         }
       } catch(e) {
         console.error("Upload failed", e);
       } finally {
         setUploading(false);
       }
    }
  };

  const removeImage = (index: number) => {
      const newImages = [...(formData.images || [])];
      newImages.splice(index, 1);
      setFormData({...formData, images: newImages});
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Celebrity Name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Booking Price (USD)</Label>
          <Input
            type="number"
            value={formData.priceUsd}
            onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
            placeholder="10000"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Images</Label>
        <div className="flex gap-2">
            <Input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
            />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
            {(formData.images || []).map((img: string, idx: number) => (
                <div key={idx} className="relative group aspect-square border rounded overflow-hidden">
                    <img src={img} className="object-cover w-full h-full" alt="preview" />
                    <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Celebrity biography..."
          rows={4}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
            id="campaign" 
            checked={formData.isCampaignAvailable}
            onCheckedChange={(checked) => setFormData({ ...formData, isCampaignAvailable: !!checked })}
        />
        <Label htmlFor="campaign">Available for Campaigns?</Label>
      </div>

      <Button onClick={() => onSubmit(formData)} disabled={isSubmitting || uploading} className="w-full">
        {isSubmitting ? "Saving..." : "Save Celebrity"}
      </Button>
    </div>
  );
};

export default function AdminCelebrities() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<Celebrity | null>(null);

  const { data: celebrities, isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        priceUsd: parseFloat(data.priceUsd).toFixed(2),
      };
      return apiRequest("POST", "/api/celebrities", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      toast({ title: "Celebrity added successfully" });
      setIsAddOpen(false);
    },
    onError: (error) => {
      toast({ title: "Failed to add celebrity", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const payload = {
        ...data,
        priceUsd: parseFloat(data.priceUsd).toFixed(2),
      };
      return apiRequest("PATCH", `/api/celebrities/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      toast({ title: "Celebrity updated successfully" });
      setEditingCelebrity(null);
    },
    onError: (error) => {
      toast({ title: "Failed to update celebrity", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/celebrities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      toast({ title: "Celebrity deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete celebrity", variant: "destructive" });
    },
  });

  const filteredCelebrities = celebrities?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Celebrity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Celebrity</DialogTitle>
                </DialogHeader>
                <CelebrityForm 
                    onSubmit={(data: any) => createMutation.mutate(data)} 
                    isSubmitting={createMutation.isPending}
                />
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
                        <TableRow key={celebrity.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={celebrity.imageUrl || undefined} />
                                <AvatarFallback>{celebrity.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{celebrity.name}</p>
                                {celebrity.isCampaignAvailable && <Badge variant="outline" className="text-[10px]">Campaigns</Badge>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{celebrity.category}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-skyline-gold">
                            ${celebrity.priceUsd}
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
                                  <Button variant="ghost" size="icon" onClick={() => setEditingCelebrity(celebrity)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Celebrity</DialogTitle>
                                  </DialogHeader>
                                  <CelebrityForm 
                                    initialData={celebrity}
                                    onSubmit={(data: any) => updateMutation.mutate({ id: celebrity.id, data })}
                                    isSubmitting={updateMutation.isPending}
                                  />
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMutation.mutate(celebrity.id)}
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
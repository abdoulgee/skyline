import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Search, Shield, ShieldOff, Edit, Trash2, Key, Save, AlertTriangle } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
      newPassword: ""
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if(!editingUser) return;
      return apiRequest("PATCH", `/api/admin/users/${editingUser.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
    },
    onError: (error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
        return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({ title: "User deleted successfully" });
        setDeleteUserId(null);
    },
    onError: (error) => {
        toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  });

  const handleEditClick = (user: User) => {
      setEditingUser(user);
      setEditForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          role: user.role,
          newPassword: ""
      });
  };

  const handleSaveUser = () => {
      const payload: any = {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          role: editForm.role
      };
      
      // Only include password if provided (non-empty)
      if (editForm.newPassword && editForm.newPassword.trim() !== "") {
          payload.password = editForm.newPassword;
      }
      
      updateUserMutation.mutate(payload);
  };

  const formatBalance = (balance: string | number) => {
    const num = typeof balance === "string" ? parseFloat(balance) : balance;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const filteredUsers = users?.filter((u) =>
    u.status !== 'deleted' && (
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Manage Users</h1>
            <p className="text-muted-foreground">View and manage registered users ({filteredUsers?.length || 0}).</p>
          </div>

          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImageUrl || undefined} />
                                <AvatarFallback>{user.firstName?.[0] || user.username?.[0]?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="text-muted-foreground">{user.email || 'No email'}</div>
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          </TableCell>
                          <TableCell className="font-medium text-skyline-gold">
                            {formatBalance(user.balanceUsd)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteUserId(user.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Make changes to user profile or reset password.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input 
                                id="firstName" 
                                value={editForm.firstName} 
                                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input 
                                id="lastName" 
                                value={editForm.lastName} 
                                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            value={editForm.email} 
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Role</Label>
                        <div className="flex gap-2">
                            <Button 
                                type="button" 
                                variant={editForm.role === 'user' ? "default" : "outline"}
                                onClick={() => setEditForm({...editForm, role: 'user'})}
                                className="flex-1"
                            >
                                <Users className="h-4 w-4 mr-2" /> User
                            </Button>
                            <Button 
                                type="button" 
                                variant={editForm.role === 'admin' ? "default" : "outline"}
                                onClick={() => setEditForm({...editForm, role: 'admin'})}
                                className="flex-1"
                            >
                                <Shield className="h-4 w-4 mr-2" /> Admin
                            </Button>
                        </div>
                    </div>
                    
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Security</span></div>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="password">Reset Password (Optional)</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="Enter new password to reset"
                            value={editForm.newPassword}
                            onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                        />
                        <p className="text-[10px] text-muted-foreground">Leave blank to keep current password.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveUser} disabled={updateUserMutation.isPending}>
                        {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" /> Delete User
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setDeleteUserId(null)}>Cancel</Button>
                    <Button 
                        variant="destructive" 
                        onClick={() => deleteUserMutation.mutate(deleteUserId!)}
                        disabled={deleteUserMutation.isPending}
                    >
                        {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </main>
    </div>
  );
}
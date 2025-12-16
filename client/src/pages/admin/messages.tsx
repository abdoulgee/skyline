import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { MessageSquare, Send, ArrowLeft, Users, Image as ImageIcon, Smile, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Message, User } from "@shared/schema";
import { Label } from "@/components/ui/label";

interface Thread {
  id: string;
  threadId: string;
  threadType: "booking" | "campaign";
  referenceId: number;
  lastMessage: Message;
  user: User;
  celebrity: {
    name: string;
    imageUrl: string | null;
  };
}

const getImageSrc = (url: string | null) => {
    if (!url) return undefined;
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/uploads/")) return url; 
    if (url.startsWith("uploads/")) return `/${url}`;
    return url;
};

export default function AdminMessages() {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const typeParam = params.get("type");
  const idParam = params.get("id");

  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads, isLoading: threadsLoading } = useQuery<Thread[]>({
    queryKey: ["/api/messages"],
    enabled: !!adminUser && adminUser.role === 'admin',
    refetchInterval: 10000, // Real-time fix: Poll threads every 10 seconds
  });

  const threadId = selectedThread ? selectedThread.threadId : null;

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", threadId],
    enabled: !!threadId,
    refetchInterval: 3000, // Real-time fix: Poll messages every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { text?: string; imageUrl?: string }) => {
      if (!selectedThread) throw new Error("No active thread.");
      
      const text = payload.text || null;
      const imageUrl = payload.imageUrl || null;
      
      if (!text && !imageUrl) throw new Error("Message content is required.");
      
      return apiRequest("POST", "/api/admin/messages", {
        threadId: selectedThread.threadId,
        threadType: selectedThread.threadType,
        referenceId: selectedThread.referenceId,
        text,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", threadId] });
      setMessage("");
    },
    onError: (error) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (typeParam && idParam && threads && !selectedThread) {
      const fullThreadId = `${typeParam}-${idParam}`;
      const thread = threads.find(
        (t) => t.threadId === fullThreadId
      );
      if (thread) {
        setSelectedThread(thread);
      }
    }
  }, [typeParam, idParam, threads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedThread]);

  const handleSendMessage = (imageUrl?: string) => {
    if (!message.trim() && !imageUrl) return;
    
    sendMessageMutation.mutate({ 
        text: message.trim() || undefined,
        imageUrl: imageUrl || undefined
    });
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("images", file); 

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      const imageUrl = data.paths[0]; 

      handleSendMessage(imageUrl);
      
    } catch (error) {
      toast({ title: "Image Upload Error", description: "Failed to upload image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };
  

  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (threadsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 p-8"><Skeleton className="h-[500px]" /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">Agent Messages</h1>
            <p className="text-muted-foreground">Respond to user inquiries as the celebrity's agent.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
            {/* Thread List */}
            <Card className={`lg:col-span-1 ${selectedThread ? "hidden lg:block" : ""}`}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[350px]">
                  {threads && threads.length > 0 ? (
                    <div className="divide-y">
                      {threads.map((thread) => (
                        <button
                          key={thread.threadId}
                          onClick={() => setSelectedThread(thread)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            selectedThread?.threadId === thread.threadId ? "bg-muted" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={thread.celebrity.imageUrl || undefined} />
                                <AvatarFallback>{thread.celebrity.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {thread.celebrity.name} (User: {thread.user.username})
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {thread.lastMessage.text || "Image message"}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                Ref: {thread.threadType.toUpperCase()} #{thread.referenceId}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Message Area */}
            <Card className={`lg:col-span-2 flex flex-col ${!selectedThread ? "hidden lg:flex" : ""}`}>
              {selectedThread ? (
                <>
                  <CardHeader className="border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSelectedThread(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedThread.celebrity.imageUrl || undefined} />
                        <AvatarFallback>{selectedThread.celebrity.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">Chatting as: {selectedThread.celebrity.name} (Agent)</p>
                        <p className="text-xs text-muted-foreground">
                          User: {selectedThread.user.firstName || selectedThread.user.username} | Topic: {selectedThread.threadType.toUpperCase()} #{selectedThread.referenceId}
                        </p>
                      </div>
                      <Badge variant="secondary">Agent Mode</Badge>
                    </div>
                  </CardHeader>

                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                       <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-10 w-1/2 ml-auto" />
                        <Skeleton className="h-10 w-full" />
                       </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.sender === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {msg.imageUrl && (
                                <img 
                                    src={getImageSrc(msg.imageUrl)} 
                                    alt="Message image" 
                                    className="max-w-xs max-h-40 rounded-lg mb-2"
                                />
                              )}
                              {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                              
                              <p className={`text-[10px] mt-1 text-right ${
                                msg.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}>
                                {new Date(msg.createdAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                        <div>
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No messages yet.</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>

                  <div className="border-t p-4 flex-shrink-0 bg-background">
                    <div className="flex items-center gap-2">
                        {/* Image Upload Button */}
                        <Label htmlFor="message-image-upload" className="cursor-pointer">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                asChild 
                                disabled={isUploading || sendMessageMutation.isPending}
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            </Button>
                        </Label>
                        <Input 
                            id="message-image-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />

                

                        {/* Text Input */}
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1"
                            autoFocus
                        />
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={(!message.trim() && !isUploading) || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-heading font-semibold text-lg mb-2">Select a conversation</h3>
                    <p className="text-sm">Choose a thread to respond as the celebrity's agent</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
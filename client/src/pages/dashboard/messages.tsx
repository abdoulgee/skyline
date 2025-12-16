import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { MessageSquare, Send, ArrowLeft, Calendar, Megaphone, Image as ImageIcon, Smile, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Message, User } from "@shared/schema";

interface Thread {
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

const getThreadContext = (thread: Thread | null) => {
    if (!thread || !thread.celebrity) return { title: "Select Conversation", subtitle: "" };
    return {
        title: thread.celebrity.name,
        subtitle: `Topic: ${thread.threadType === 'booking' ? 'Booking' : 'Campaign'} #${thread.referenceId}`
    };
};

export default function MessagesPage() {
  const { user } = useAuth();
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
    enabled: !!user,
    refetchInterval: 10000,
  });
  
  const threadId = selectedThread?.threadId || (typeParam && idParam ? `${typeParam}-${idParam}` : null);

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", threadId],
    enabled: !!threadId,
    refetchInterval: 3000, 
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { text?: string; imageUrl?: string }) => {
      if (!threadId || !selectedThread) throw new Error("No active thread.");
      const text = payload.text || null;
      const imageUrl = payload.imageUrl || null;
      if (!text && !imageUrl) throw new Error("Message content is required.");

      return apiRequest("POST", "/api/messages", {
        threadId,
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
        const foundThread = threads.find(t => t.threadId === fullThreadId);
        if (foundThread) {
            setSelectedThread(foundThread);
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
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      handleSendMessage(data.paths[0]);
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

  if (threadsLoading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const threadContext = getThreadContext(selectedThread);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden container mx-auto px-0 md:px-6 lg:px-8 py-0 md:py-6">
        
        {/* Header - Only visible on Desktop or when no thread selected on mobile */}
        <div className={`px-4 py-4 md:py-0 ${selectedThread ? "hidden md:block" : "block"}`}>
          <h1 className="font-heading font-bold text-2xl md:text-3xl mb-1">Message Center</h1>
          <p className="text-muted-foreground text-sm">Communicate with agents regarding your requests.</p>
        </div>

        <div className="flex-1 flex flex-col md:grid md:grid-cols-3 gap-6 overflow-hidden pb-0 md:pb-0 relative">
          
          {/* Thread List - Hidden on mobile if thread selected */}
          <Card className={`md:col-span-1 flex flex-col ${selectedThread ? "hidden md:flex" : "flex"} h-full rounded-none md:rounded-lg border-x-0 md:border border-t-0 md:border-t`}>
            <CardHeader className="py-3 md:py-6 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversations ({threads?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
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
                              <AvatarImage src={getImageSrc(thread.celebrity?.imageUrl || null)} />
                              <AvatarFallback>{thread.celebrity?.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {thread.celebrity?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {thread.lastMessage?.text || (thread.lastMessage?.imageUrl ? "Image" : "No message")}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {thread.threadType.toUpperCase()} #{thread.referenceId}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p className="text-sm">No active conversations.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Area - Visible on mobile if thread selected, always on desktop */}
          {/* Using fixed positioning on mobile to ensure full height and proper input placement */}
          <Card className={`md:col-span-2 flex flex-col ${!selectedThread ? "hidden md:flex" : "flex fixed inset-0 z-50 md:static"} h-full rounded-none md:rounded-lg border-0 md:border bg-background`}>
            {selectedThread ? (
              <>
                <CardHeader className="border-b flex-shrink-0 py-3 px-4 flex-row items-center gap-3 space-y-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2"
                    onClick={() => setSelectedThread(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={getImageSrc(selectedThread.celebrity?.imageUrl || null)} />
                    <AvatarFallback>{selectedThread.celebrity?.name?.[0] || "A"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate text-sm md:text-base">{threadContext.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{threadContext.subtitle}</p>
                  </div>
                </CardHeader>

                <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
                  {messagesLoading ? (
                     <div className="space-y-4">
                      <Skeleton className="h-10 w-3/4" />
                      <Skeleton className="h-10 w-1/2 ml-auto" />
                      <Skeleton className="h-10 w-full" />
                     </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4 pb-2">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === "admin" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl ${
                              msg.sender === "admin"
                                ? "bg-muted text-foreground rounded-tl-sm"
                                : "bg-primary text-primary-foreground rounded-tr-sm"
                            }`}
                          >
                            {msg.imageUrl && (
                              <img 
                                  src={getImageSrc(msg.imageUrl)} 
                                  alt="Message image" 
                                  className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(getImageSrc(msg.imageUrl), "_blank")}
                              />
                            )}
                            {msg.text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                            
                            <p className={`text-[10px] mt-1 text-right opacity-70`}>
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
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Start the conversation.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t p-2 md:p-4 flex-shrink-0 bg-background safe-area-pb">
                  <div className="flex items-end gap-2">
                      {/* Image Upload Button */}
                      <Label htmlFor="message-image-upload" className="cursor-pointer mb-0 pb-1">
                          <div className={`h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${isUploading || sendMessageMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                          </div>
                      </Label>
                      <Input 
                          id="message-image-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                          disabled={isUploading}
                      />

                      {/* Emoji Picker */}

                      {/* Text Input */}
                      <div className="flex-1 relative">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Message..."
                            className="flex-1 min-h-[44px] py-2 rounded-full px-4 border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-primary"
                            autoFocus
                        />
                      </div>
                      
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={(!message.trim() && !isUploading) || sendMessageMutation.isPending}
                      size="icon"
                      className="h-11 w-11 rounded-full shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-heading font-semibold text-lg mb-2">Message Center</h3>
                  <p className="text-sm">Select a conversation to start chatting.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      
      {/* Conditionally render nav only on main screen, not inside chat on mobile */}
      <div className={selectedThread ? "hidden md:block" : "block"}>
        <MobileNav />
      </div>
    </div>
  );
}
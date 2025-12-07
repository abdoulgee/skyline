import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { MessageSquare, Send, ArrowLeft, Calendar, Megaphone, Users } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message, BookingWithDetails, CampaignWithDetails } from "@shared/schema";

interface Thread {
  id: string;
  type: "booking" | "campaign";
  referenceId: number;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImageUrl?: string | null;
  };
  celebrity: {
    name: string;
    imageUrl: string | null;
  };
}

export default function AdminMessages() {
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const typeParam = params.get("type");
  const idParam = params.get("id");

  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: bookings } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/bookings"],
  });

  const { data: campaigns } = useQuery<CampaignWithDetails[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const threadId = selectedThread ? `${selectedThread.type}-${selectedThread.referenceId}` : null;

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/admin/messages", threadId],
    enabled: !!threadId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedThread) return;
      return apiRequest("POST", "/api/admin/messages", {
        threadId: `${selectedThread.type}-${selectedThread.referenceId}`,
        threadType: selectedThread.type,
        referenceId: selectedThread.referenceId,
        text,
        sender: "agent",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages", threadId] });
      setMessage("");
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const threads: Thread[] = [
    ...(bookings?.map((b) => ({
      id: `booking-${b.id}`,
      type: "booking" as const,
      referenceId: b.id,
      user: {
        firstName: b.user?.firstName,
        lastName: b.user?.lastName,
        email: b.user?.email,
        profileImageUrl: b.user?.profileImageUrl,
      },
      celebrity: {
        name: b.celebrity?.name || "Unknown",
        imageUrl: b.celebrity?.imageUrl || null,
      },
    })) || []),
    ...(campaigns?.map((c) => ({
      id: `campaign-${c.id}`,
      type: "campaign" as const,
      referenceId: c.id,
      user: {
        firstName: c.user?.firstName,
        lastName: c.user?.lastName,
        email: c.user?.email,
        profileImageUrl: c.user?.profileImageUrl,
      },
      celebrity: {
        name: c.celebrity?.name || "Unknown",
        imageUrl: c.celebrity?.imageUrl || null,
      },
    })) || []),
  ];

  useEffect(() => {
    if (typeParam && idParam && threads.length > 0) {
      const thread = threads.find(
        (t) => t.type === typeParam && t.referenceId === parseInt(idParam)
      );
      if (thread) {
        setSelectedThread(thread);
      }
    }
  }, [typeParam, idParam, threads.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            <Card className={`lg:col-span-1 ${selectedThread ? "hidden lg:block" : ""}`}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[350px]">
                  {threads.length > 0 ? (
                    <div className="divide-y">
                      {threads.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => setSelectedThread(thread)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            selectedThread?.id === thread.id ? "bg-muted" : ""
                          }`}
                          data-testid={`thread-${thread.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={thread.user.profileImageUrl || undefined} />
                              <AvatarFallback>{thread.user.firstName?.[0] || thread.user.email?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">
                                  {thread.user.firstName} {thread.user.lastName}
                                </p>
                                {thread.type === "booking" ? (
                                  <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
                                ) : (
                                  <Megaphone className="h-3 w-3 text-chart-4 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {thread.celebrity.name} - {thread.type} #{thread.referenceId}
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
                        data-testid="button-back-threads"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedThread.user.profileImageUrl || undefined} />
                        <AvatarFallback>{selectedThread.user.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {selectedThread.user.firstName} {selectedThread.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedThread.celebrity.name} - {selectedThread.type} #{selectedThread.referenceId}
                        </p>
                      </div>
                      <Badge variant="secondary">Responding as Agent</Badge>
                    </div>
                  </CardHeader>

                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-3/4" />
                        ))}
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
                            data-testid={`message-${msg.id}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.sender === "agent"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <p className={`text-xs mt-1 ${
                                msg.sender === "agent" ? "text-primary-foreground/70" : "text-muted-foreground"
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
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation with the user</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>

                  <div className="border-t p-4 flex-shrink-0">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message as agent..."
                        className="flex-1"
                        data-testid="input-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        data-testid="button-send-message"
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

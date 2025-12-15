import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message, BookingWithDetails, CampaignWithDetails } from "@shared/schema";

interface Thread {
  id: string;
  type: "booking" | "campaign";
  referenceId: number;
  celebrity: {
    name: string;
    imageUrl: string | null;
  };
}

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const typeParam = params.get("type");
  const idParam = params.get("id");

  const { data: bookings } = useQuery<BookingWithDetails[]>({ queryKey: ["/api/bookings"] });
  const { data: campaigns } = useQuery<CampaignWithDetails[]>({ queryKey: ["/api/campaigns"] });

  const threads: Thread[] = [
    ...(bookings?.map(b => ({
      id: `booking-${b.id}`,
      type: "booking" as const,
      referenceId: b.id,
      celebrity: { name: b.celebrity?.name || "Unknown", imageUrl: b.celebrity?.imageUrl }
    })) || []),
    ...(campaigns?.map(c => ({
      id: `campaign-${c.id}`,
      type: "campaign" as const,
      referenceId: c.id,
      celebrity: { name: c.celebrity?.name || "Unknown", imageUrl: c.celebrity?.imageUrl }
    })) || [])
  ];

  const threadId = selectedThread ? `${selectedThread.type}-${selectedThread.referenceId}` : null;
  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages", threadId],
    enabled: !!threadId,
    refetchInterval: 3000 // Simple polling for new messages
  });

  useEffect(() => {
    if (typeParam && idParam && threads.length > 0) {
      const thread = threads.find(t => t.type === typeParam && t.referenceId === parseInt(idParam));
      if (thread) setSelectedThread(thread);
    }
  }, [typeParam, idParam, threads.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedThread) return;
      return apiRequest("POST", "/api/messages", {
        threadId,
        threadType: selectedThread.type,
        referenceId: selectedThread.referenceId,
        text,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", threadId] });
      setMessage("");
    },
  });

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {/* Thread List */}
                <Card className={`md:col-span-1 h-full flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
                    <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                        {threads.map(thread => (
                            <div 
                                key={thread.id} 
                                onClick={() => setSelectedThread(thread)}
                                className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${selectedThread?.id === thread.id ? 'bg-muted' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={thread.celebrity.imageUrl || undefined} />
                                        <AvatarFallback>{thread.celebrity.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{thread.celebrity.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{thread.type} #{thread.referenceId}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className={`md:col-span-2 h-full flex flex-col ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
                    {selectedThread ? (
                        <>
                            <CardHeader className="border-b py-3 flex flex-row items-center gap-2">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedThread(null)}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedThread.celebrity.imageUrl || undefined} />
                                    <AvatarFallback>{selectedThread.celebrity.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{selectedThread.celebrity.name}</p>
                                    <p className="text-xs text-green-600">Online</p>
                                </div>
                            </CardHeader>
                            <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900/50">
                                <div className="space-y-4">
                                    {messages?.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-lg ${
                                                msg.sender === 'user' 
                                                ? 'bg-skyline-cyan text-white rounded-br-none' 
                                                : 'bg-white dark:bg-slate-800 border rounded-bl-none shadow-sm'
                                            }`}>
                                                <p className="text-sm">{msg.text}</p>
                                                <p className="text-[10px] opacity-70 mt-1 text-right">
                                                    {new Date(msg.createdAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-background">
                                <div className="flex gap-2">
                                    <Input 
                                        value={message} 
                                        onChange={e => setMessage(e.target.value)} 
                                        placeholder="Type a message..." 
                                        onKeyPress={e => e.key === 'Enter' && sendMessageMutation.mutate(message)}
                                    />
                                    <Button onClick={() => sendMessageMutation.mutate(message)} disabled={!message.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Select a conversation to start chatting
                        </div>
                    )}
                </Card>
            </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
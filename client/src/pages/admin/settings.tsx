import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Save, Wallet } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SiBitcoin, SiEthereum, SiTether } from "react-icons/si";

export default function AdminSettings() {
  const { toast } = useToast();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const [wallets, setWallets] = useState({
    BTC: "",
    ETH: "",
    USDT: "",
  });

  useEffect(() => {
    if (settings) {
      setWallets({
        // Keys returned from server are uppercase now (WALLET_BTC)
        BTC: settings.WALLET_BTC || "",
        ETH: settings.WALLET_ETH || "",
        USDT: settings.WALLET_USDT || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/settings", {
        BTC_WALLET: wallets.BTC,
        ETH_WALLET: wallets.ETH,
        USDT_WALLET: wallets.USDT,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/wallets"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Admin Wallet Addresses</CardTitle>
                <CardDescription>These addresses will be displayed to users when they deposit funds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Bitcoin (BTC)</Label>
                  <div className="relative">
                    <SiBitcoin className="absolute left-3 top-3 text-orange-500" />
                    <Input className="pl-10" value={wallets.BTC} onChange={e => setWallets({...wallets, BTC: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ethereum (ETH)</Label>
                  <div className="relative">
                    <SiEthereum className="absolute left-3 top-3 text-blue-500" />
                    <Input className="pl-10" value={wallets.ETH} onChange={e => setWallets({...wallets, ETH: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>USDT (TRC20)</Label>
                  <div className="relative">
                    <SiTether className="absolute left-3 top-3 text-green-500" />
                    <Input className="pl-10" value={wallets.USDT} onChange={e => setWallets({...wallets, USDT: e.target.value})} />
                  </div>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    {saveMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
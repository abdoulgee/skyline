import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Celebrities from "@/pages/celebrities";
import CelebrityProfile from "@/pages/celebrity-profile";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";

import Dashboard from "@/pages/dashboard/index";
import WalletPage from "@/pages/dashboard/wallet";
import BookingsPage from "@/pages/dashboard/bookings";
import CampaignsPage from "@/pages/dashboard/campaigns";
import MessagesPage from "@/pages/dashboard/messages";
import NotificationsPage from "@/pages/dashboard/notifications";
import ProfilePage from "@/pages/dashboard/profile";
import BookCelebrityPage from "@/pages/dashboard/book";
import CampaignRequestPage from "@/pages/dashboard/campaign";

import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminCelebrities from "@/pages/admin/celebrities";
import AdminBookings from "@/pages/admin/bookings";
import AdminCampaigns from "@/pages/admin/campaigns";
import AdminDeposits from "@/pages/admin/deposits";
import AdminMessages from "@/pages/admin/messages";
import AdminSettings from "@/pages/admin/settings";

import NotFound from "@/pages/not-found";

// Simple Campaign Directory Page (Using Celebrities list filtered for campaigns)
function PublicCampaigns() {
    return <Celebrities defaultFilter="campaign" />
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/celebrities" component={Celebrities} />
      <Route path="/campaigns" component={PublicCampaigns} />
      <Route path="/celebrity/:id">
        {(params) => <CelebrityProfile />}
      </Route>
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* --- Protected USER Dashboard Routes --- */}
      <Route path="/dashboard">
        <ProtectedRoute path="/dashboard" component={Dashboard} />
      </Route>
      <Route path="/dashboard/wallet">
        <ProtectedRoute path="/dashboard/wallet" component={WalletPage} />
      </Route>
      <Route path="/dashboard/bookings">
        <ProtectedRoute path="/dashboard/bookings" component={BookingsPage} />
      </Route>
      <Route path="/dashboard/campaigns">
        <ProtectedRoute path="/dashboard/campaigns" component={CampaignsPage} />
      </Route>
      <Route path="/dashboard/messages">
        <ProtectedRoute path="/dashboard/messages" component={MessagesPage} />
      </Route>
      <Route path="/dashboard/notifications">
        <ProtectedRoute path="/dashboard/notifications" component={NotificationsPage} />
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute path="/dashboard/profile" component={ProfilePage} />
      </Route>
      
      <Route path="/dashboard/book/:id">
        {(params) => <ProtectedRoute path={`/dashboard/book/${params.id}`} component={BookCelebrityPage} />}
      </Route>
      <Route path="/dashboard/campaign/:id">
        {(params) => <ProtectedRoute path={`/dashboard/campaign/${params.id}`} component={CampaignRequestPage} />}
      </Route>

      {/* --- Protected ADMIN Routes --- */}
      <Route path="/admin">
        <ProtectedRoute path="/admin" component={AdminDashboard} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute path="/admin/users" component={AdminUsers} />
      </Route>
      <Route path="/admin/celebrities">
        <ProtectedRoute path="/admin/celebrities" component={AdminCelebrities} />
      </Route>
      <Route path="/admin/bookings">
        <ProtectedRoute path="/admin/bookings" component={AdminBookings} />
      </Route>
      <Route path="/admin/campaigns">
        <ProtectedRoute path="/admin/campaigns" component={AdminCampaigns} />
      </Route>
      <Route path="/admin/deposits">
        <ProtectedRoute path="/admin/deposits" component={AdminDeposits} />
      </Route>
      <Route path="/admin/messages">
        <ProtectedRoute path="/admin/messages" component={AdminMessages} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute path="/admin/settings" component={AdminSettings} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { NewsCreationProvider } from "@/contexts/NewsCreationContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewsDetail from "./pages/NewsDetail";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";
import StoryViewer from "./pages/StoryViewer";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import NewsList from "./pages/admin/NewsList";
import NewsEditor from "./pages/admin/NewsEditor";
import Categories from "./pages/admin/Categories";
import Tags from "./pages/admin/Tags";
import Banners from "./pages/admin/Banners";
import Ads from "./pages/admin/Ads";
import StoriesList from "./pages/admin/StoriesList";
import StoryEditor from "./pages/admin/StoryEditor";
import Users from "./pages/admin/Users";
import HomeEditor from "./pages/admin/HomeEditor";
import QuickNotesAdmin from "./pages/admin/QuickNotesAdmin";
import Analytics from "./pages/admin/Analytics";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";
import NoticiasAI from "./pages/admin/NoticiasAI";
import SocialDashboard from "./pages/admin/SocialDashboard";
import SocialQueue from "./pages/admin/SocialQueue";
import SocialHistory from "./pages/admin/SocialHistory";
import SocialLogs from "./pages/admin/SocialLogs";
import SocialSettings from "./pages/admin/SocialSettings";
import LinksDashboard from "./pages/admin/LinksDashboard";
import LinksBuilder from "./pages/admin/LinksBuilder";
import Solutions from "./pages/admin/Solutions";
import EventsList from "./pages/admin/EventsList";
import EditionsList from "./pages/admin/EditionsList";
import FinancialDashboard from "./pages/admin/FinancialDashboard";
import TrainingHub from "./pages/admin/TrainingHub";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <NewsCreationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/noticia/:slug" element={<NewsDetail />} />
              <Route path="/categoria/:slug" element={<CategoryPage />} />
            </Route>
            <Route path="/story/:slug" element={<StoryViewer />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="noticias-ai" element={<NoticiasAI />} />
              <Route path="news" element={<NewsList />} />
              <Route path="news/new" element={<NewsEditor />} />
              <Route path="news/:id/edit" element={<NewsEditor />} />
              <Route path="categories" element={<Categories />} />
              <Route path="tags" element={<Tags />} />
              <Route path="banners" element={<Banners />} />
              <Route path="ads" element={<Ads />} />
              <Route path="stories" element={<StoriesList />} />
              <Route path="stories/new" element={<StoryEditor />} />
              <Route path="stories/:id/edit" element={<StoryEditor />} />
              <Route path="users" element={<Users />} />
              <Route path="home-editor" element={<HomeEditor />} />
              <Route path="quick-notes" element={<QuickNotesAdmin />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="social" element={<SocialDashboard />} />
              <Route path="social/queue" element={<SocialQueue />} />
              <Route path="social/history" element={<SocialHistory />} />
              <Route path="social/logs" element={<SocialLogs />} />
              <Route path="social/settings" element={<SocialSettings />} />
              <Route path="links" element={<LinksDashboard />} />
              <Route path="links/create" element={<LinksBuilder />} />
              <Route path="logs" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="solutions" element={<Solutions />} />
              <Route path="events" element={<EventsList />} />
              <Route path="editions" element={<EditionsList />} />
              <Route path="financial" element={<FinancialDashboard />} />
              <Route path="training" element={<TrainingHub />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NewsCreationProvider>
  </AccessibilityProvider>
</AuthProvider>
</QueryClientProvider>
</HelmetProvider>
);

export default App;

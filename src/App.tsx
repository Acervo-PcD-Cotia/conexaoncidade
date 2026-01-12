import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { NewsCreationProvider } from "@/contexts/NewsCreationContext";
import { NewsCreationModalProvider } from "@/contexts/NewsCreationModalContext";
import { MaintenanceGuard } from "@/components/maintenance/MaintenanceGuard";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewsDetail from "./pages/NewsDetail";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";
import StoryViewer from "./pages/StoryViewer";
import EventDetail from "./pages/EventDetail";
import AntiFakeNews from "./pages/AntiFakeNews";
import EditionViewer from "./pages/EditionViewer";
import StoriesPage from "./pages/StoriesPage";
import ResetPassword from "./pages/ResetPassword";

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
import EditionEditor from "./pages/admin/EditionEditor";
import FinancialDashboard from "./pages/admin/FinancialDashboard";
import TrainingHub from "./pages/admin/TrainingHub";
import PodcastsList from "./pages/admin/PodcastsList";
import AntiFakeNewsAdmin from "./pages/admin/AntiFakeNewsAdmin";

// Auto Post PRO Pages
import AutoPostDashboard from "./pages/admin/autopost/AutoPostDashboard";
import AutoPostSources from "./pages/admin/autopost/AutoPostSources";
import AutoPostQueue from "./pages/admin/autopost/AutoPostQueue";
import AutoPostGroups from "./pages/admin/autopost/AutoPostGroups";
import AutoPostRules from "./pages/admin/autopost/AutoPostRules";
import AutoPostSchedules from "./pages/admin/autopost/AutoPostSchedules";
import AutoPostMedia from "./pages/admin/autopost/AutoPostMedia";
import AutoPostDuplicates from "./pages/admin/autopost/AutoPostDuplicates";
import AutoPostLogs from "./pages/admin/autopost/AutoPostLogs";
import AutoPostReports from "./pages/admin/autopost/AutoPostReports";
import AutoPostSettings from "./pages/admin/autopost/AutoPostSettings";

// Community Pages
import CommunityHub from "./pages/community/CommunityHub";
import CommunityUnlock from "./pages/community/CommunityUnlock";
import CommunityAuth from "./pages/community/CommunityAuth";
import ChallengesPage from "./pages/community/ChallengesPage";
import HowToEarnPoints from "./pages/community/HowToEarnPoints";
import MemberProfile from "./pages/community/MemberProfile";

// Auto Post PRO Form
import AutoPostSourceForm from "./pages/admin/autopost/AutoPostSourceForm";

// Partners Pages
import PartnersInbox from "./pages/admin/partners/PartnersInbox";
import PartnersManage from "./pages/admin/partners/PartnersManage";
import PartnersSources from "./pages/admin/partners/PartnersSources";
import PartnersPitches from "./pages/admin/partners/PartnersPitches";

// Community Admin Pages
import CommunityAdmin from "./pages/admin/community/CommunityAdmin";
import CommunityMembers from "./pages/admin/community/CommunityMembers";
import CommunityModeration from "./pages/admin/community/CommunityModeration";

// Campaign Pages
import GoogleMapsCampaign from "./pages/campaigns/GoogleMapsCampaign";
import GoogleMapsLeads from "./pages/admin/campaigns/GoogleMapsLeads";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <NewsCreationProvider>
            <NewsCreationModalProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <MaintenanceGuard>
                    <Routes>
                      {/* Public Routes */}
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/noticia/:slug" element={<NewsDetail />} />
                        <Route path="/categoria/:slug" element={<CategoryPage />} />
                        <Route path="/comunidade" element={<CommunityHub />} />
                        <Route path="/comunidade/desbloquear" element={<CommunityUnlock />} />
                        <Route path="/comunidade/desafios" element={<ChallengesPage />} />
                        <Route path="/comunidade/como-ganhar-pontos" element={<HowToEarnPoints />} />
                        <Route path="/comunidade/membro/:userId" element={<MemberProfile />} />
                        <Route path="/anti-fake-news" element={<AntiFakeNews />} />
                        <Route path="/campanha/google-maps" element={<GoogleMapsCampaign />} />
                        <Route path="/stories" element={<StoriesPage />} />
                      </Route>
                      <Route path="/story/:slug" element={<StoryViewer />} />
                      <Route path="/evento/:slug" element={<EventDetail />} />
                      <Route path="/edicao/:slug" element={<EditionViewer />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth-comunidade" element={<CommunityAuth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
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
                        <Route path="editions/new" element={<EditionEditor />} />
                        <Route path="editions/:id/edit" element={<EditionEditor />} />
                        <Route path="financial" element={<FinancialDashboard />} />
                        <Route path="training" element={<TrainingHub />} />
                        <Route path="podcasts" element={<PodcastsList />} />
                        <Route path="anti-fake-news" element={<AntiFakeNewsAdmin />} />
                        
                        {/* Auto Post PRO Routes */}
                        <Route path="autopost" element={<AutoPostDashboard />} />
                        <Route path="autopost/sources" element={<AutoPostSources />} />
                        <Route path="autopost/queue" element={<AutoPostQueue />} />
                        <Route path="autopost/groups" element={<AutoPostGroups />} />
                        <Route path="autopost/rules" element={<AutoPostRules />} />
                        <Route path="autopost/schedules" element={<AutoPostSchedules />} />
                        <Route path="autopost/media" element={<AutoPostMedia />} />
                        <Route path="autopost/duplicates" element={<AutoPostDuplicates />} />
                        <Route path="autopost/logs" element={<AutoPostLogs />} />
                        <Route path="autopost/reports" element={<AutoPostReports />} />
                        <Route path="autopost/settings" element={<AutoPostSettings />} />
                        <Route path="autopost/sources/new" element={<AutoPostSourceForm />} />
                        <Route path="autopost/sources/:id/edit" element={<AutoPostSourceForm />} />
                        
                        {/* Partners Routes */}
                        <Route path="partners" element={<PartnersInbox />} />
                        <Route path="partners/manage" element={<PartnersManage />} />
                        <Route path="partners/sources" element={<PartnersSources />} />
                        <Route path="partners/pitches" element={<PartnersPitches />} />
                        
                        {/* Community Admin Routes */}
                        <Route path="community" element={<CommunityAdmin />} />
                        <Route path="community/members" element={<CommunityMembers />} />
                        <Route path="community/moderation" element={<CommunityModeration />} />
                        
                        {/* Campaign Admin Routes */}
                        <Route path="campaigns/google-maps" element={<GoogleMapsLeads />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MaintenanceGuard>
                </BrowserRouter>
              </TooltipProvider>
            </NewsCreationModalProvider>
          </NewsCreationProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

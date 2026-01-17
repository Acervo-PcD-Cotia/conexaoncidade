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
import NewsListPage from "./pages/NewsListPage";
import SearchPage from "./pages/SearchPage";

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
import ReadingAnalytics from "./pages/admin/ReadingAnalytics";
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
import FinancialProfiles from "./pages/admin/FinancialProfiles";
import FinancialReceivables from "./pages/admin/FinancialReceivables";
import FinancialInvoices from "./pages/admin/FinancialInvoices";
import TrainingHub from "./pages/admin/TrainingHub";
import PodcastsList from "./pages/admin/PodcastsList";
import AntiFakeNewsAdmin from "./pages/admin/AntiFakeNewsAdmin";
import LinksQRGenerator from "./pages/admin/LinksQRGenerator";
import LinksBioBuilder from "./pages/admin/LinksBioBuilder";
import LinksReports from "./pages/admin/LinksReports";
import CampaignsHub from "./pages/admin/CampaignsHub";

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
import ProfileSettings from "./pages/community/ProfileSettings";
import GamificationPage from "./pages/community/GamificationPage";
import CommunityMap from "./pages/community/CommunityMap";
import RedeDoBem from "./pages/community/RedeDoBem";
import CommunityGroups from "./pages/community/CommunityGroups";
import CommunityBenefits from "./pages/community/CommunityBenefits";

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
import PhoneCatalogAdmin from "./pages/admin/community/PhoneCatalogAdmin";
import PhoneOffersReport from "./pages/admin/community/PhoneOffersReport";
import PhoneImportAssisted from "./pages/admin/community/PhoneImportAssisted";

// Community Benefit Pages
import PhoneChooserPage from "./pages/community/PhoneChooserPage";

// Campaign Pages
import GoogleMapsCampaign from "./pages/campaigns/GoogleMapsCampaign";
import GoogleMapsLeads from "./pages/admin/campaigns/GoogleMapsLeads";

// Transporte Escolar Pages
import TransporteEscolarHome from "./pages/transporte-escolar/TransporteEscolarHome";
import TransporteEscolarEncontrar from "./pages/transporte-escolar/TransporteEscolarEncontrar";
import TransporteEscolarCadastrar from "./pages/transporte-escolar/TransporteEscolarCadastrar";
import TransporteEscolarEscola from "./pages/transporte-escolar/TransporteEscolarEscola";
import TransporteEscolarRede from "./pages/transporte-escolar/TransporteEscolarRede";
import TransporteEscolarBairro from "./pages/transporte-escolar/TransporteEscolarBairro";

// Transporte Escolar Admin Pages
import TransporteEscolarAdmin from "./pages/admin/transporte-escolar/TransporteEscolarAdmin";
import EscolasAdmin from "./pages/admin/transporte-escolar/EscolasAdmin";
import TransportadoresAdmin from "./pages/admin/transporte-escolar/TransportadoresAdmin";
import LeadsAdmin from "./pages/admin/transporte-escolar/LeadsAdmin";
import ReportsAdmin from "./pages/admin/transporte-escolar/ReportsAdmin";

// Censo PcD Pages
import CensoPcdHome from "./pages/censo-pcd/CensoPcdHome";
import CensoPcdQuiz from "./pages/censo-pcd/CensoPcdQuiz";
import CensoPcdConclusao from "./pages/censo-pcd/CensoPcdConclusao";

// Censo PcD Admin Pages
import CensoPcdDashboard from "./pages/admin/censo-pcd/CensoPcdDashboard";
import CensoPcdRespostas from "./pages/admin/censo-pcd/CensoPcdRespostas";

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
                        <Route path="/noticias" element={<NewsListPage />} />
                        <Route path="/busca" element={<SearchPage />} />
                        <Route path="/categoria/:slug" element={<CategoryPage />} />
                        <Route path="/comunidade" element={<CommunityHub />} />
                        <Route path="/comunidade/desbloquear" element={<CommunityUnlock />} />
                        <Route path="/comunidade/desafios" element={<ChallengesPage />} />
                        <Route path="/comunidade/como-ganhar-pontos" element={<HowToEarnPoints />} />
                        <Route path="/comunidade/membro/:userId" element={<MemberProfile />} />
                        <Route path="/comunidade/configuracoes" element={<ProfileSettings />} />
                        <Route path="/comunidade/gamificacao" element={<GamificationPage />} />
                        <Route path="/comunidade/guia" element={<CommunityMap />} />
                        <Route path="/comunidade/mapa" element={<Navigate to="/comunidade/guia" replace />} />
                        <Route path="/comunidade/rede-do-bem" element={<RedeDoBem />} />
                        <Route path="/comunidade/grupos" element={<CommunityGroups />} />
                        <Route path="/comunidade/grupos/:slug" element={<CommunityGroups />} />
                        <Route path="/comunidade/beneficios" element={<CommunityBenefits />} />
                        <Route path="/comunidade/beneficios/celular-ideal" element={<PhoneChooserPage />} />
                        <Route path="/anti-fake-news" element={<AntiFakeNews />} />
                        <Route path="/campanha/google-maps" element={<GoogleMapsCampaign />} />
                        <Route path="/google-maps" element={<GoogleMapsCampaign />} />
                        <Route path="/transporte-escolar" element={<TransporteEscolarHome />} />
                        <Route path="/transporte-escolar/encontrar" element={<TransporteEscolarEncontrar />} />
                        <Route path="/transporte-escolar/cadastrar" element={<TransporteEscolarCadastrar />} />
                        <Route path="/transporte-escolar/escola/:slug" element={<TransporteEscolarEscola />} />
                        <Route path="/transporte-escolar/rede/:rede" element={<TransporteEscolarRede />} />
                        <Route path="/transporte-escolar/bairro/:bairro" element={<TransporteEscolarBairro />} />
                        <Route path="/censo-pcd" element={<CensoPcdHome />} />
                        <Route path="/censo-pcd/participar" element={<CensoPcdQuiz />} />
                        <Route path="/censo-pcd/concluido" element={<CensoPcdConclusao />} />
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
                        <Route path="analytics/leitura" element={<ReadingAnalytics />} />
                        <Route path="social" element={<SocialDashboard />} />
                        <Route path="social/queue" element={<SocialQueue />} />
                        <Route path="social/history" element={<SocialHistory />} />
                        <Route path="social/logs" element={<SocialLogs />} />
                        <Route path="social/settings" element={<SocialSettings />} />
                        <Route path="links" element={<LinksDashboard />} />
                        <Route path="links/create" element={<LinksBuilder />} />
                        <Route path="links/qr" element={<LinksQRGenerator />} />
                        <Route path="links/bio" element={<LinksBioBuilder />} />
                        <Route path="links/reports" element={<LinksReports />} />
                        <Route path="logs" element={<AuditLogs />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="solutions" element={<Solutions />} />
                        <Route path="events" element={<EventsList />} />
                        <Route path="editions" element={<EditionsList />} />
                        <Route path="editions/new" element={<EditionEditor />} />
                        <Route path="editions/:id/edit" element={<EditionEditor />} />
                        <Route path="financial" element={<FinancialDashboard />} />
                        <Route path="financial/profiles" element={<FinancialProfiles />} />
                        <Route path="financial/receivables" element={<FinancialReceivables />} />
                        <Route path="financial/invoices" element={<FinancialInvoices />} />
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
                        <Route path="community/phone-catalog" element={<PhoneCatalogAdmin />} />
                        <Route path="community/phone-offers-report" element={<PhoneOffersReport />} />
                        <Route path="community/phone-import" element={<PhoneImportAssisted />} />
                        
                        {/* Campaign Admin Routes */}
                        <Route path="campaigns" element={<CampaignsHub />} />
                        <Route path="campaigns/google-maps" element={<GoogleMapsLeads />} />
                        
                        {/* Transporte Escolar Admin Routes */}
                        <Route path="transporte-escolar" element={<TransporteEscolarAdmin />} />
                        <Route path="transporte-escolar/escolas" element={<EscolasAdmin />} />
                        <Route path="transporte-escolar/transportadores" element={<TransportadoresAdmin />} />
                        <Route path="transporte-escolar/leads" element={<LeadsAdmin />} />
                        <Route path="transporte-escolar/reports" element={<ReportsAdmin />} />
                        
                        {/* Censo PcD Admin Routes */}
                        <Route path="censo-pcd" element={<CensoPcdDashboard />} />
                        <Route path="censo-pcd/respostas" element={<CensoPcdRespostas />} />
                        
                        {/* Classifieds & Jobs Admin */}
                        <Route path="classifieds" element={<ClassifiedsAdmin />} />
                        <Route path="jobs" element={<JobsAdmin />} />
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

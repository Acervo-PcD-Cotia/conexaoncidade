import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { NewsCreationProvider } from "@/contexts/NewsCreationContext";
import { NewsCreationModalProvider } from "@/contexts/NewsCreationModalContext";
import { MiniPlayerProvider } from "@/contexts/MiniPlayerContext";
import { SiteThemeProvider } from "@/providers/SiteThemeProvider";
import { MaintenanceGuard } from "@/components/maintenance/MaintenanceGuard";
import { RouteModuleGuard } from "@/components/guards/RouteModuleGuard";
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
import CommercialReports from "./pages/admin/CommercialReports";
import AuditLogs from "./pages/admin/AuditLogs";
import SsoMonitor from "./pages/admin/SsoMonitor";
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

// Conexão Academy Pages
import AcademyDashboard from "./pages/admin/academy/AcademyDashboard";
import AcademyCourse from "./pages/admin/academy/AcademyCourse";
import AcademyLesson from "./pages/admin/academy/AcademyLesson";
import AcademyAdminCategories from "./pages/admin/academy/AcademyAdminCategories";
import AcademyAdminCourses from "./pages/admin/academy/AcademyAdminCourses";
import AcademyAdminLessons from "./pages/admin/academy/AcademyAdminLessons";

// Publidoor Pages
import PublidoorDashboard from "./pages/admin/publidoor/PublidoorDashboard";
import PublidoorCreate from "./pages/admin/publidoor/PublidoorCreate";
import PublidoorEdit from "./pages/admin/publidoor/PublidoorEdit";
import PublidoorCampaigns from "./pages/admin/publidoor/PublidoorCampaigns";
import PublidoorLocations from "./pages/admin/publidoor/PublidoorLocations";
import PublidoorSchedules from "./pages/admin/publidoor/PublidoorSchedules";
import PublidoorAdvertisers from "./pages/admin/publidoor/PublidoorAdvertisers";
import PublidoorMetrics from "./pages/admin/publidoor/PublidoorMetrics";
import PublidoorTemplates from "./pages/admin/publidoor/PublidoorTemplates";
import PublidoorApprovals from "./pages/admin/publidoor/PublidoorApprovals";
import PublidoorSettings from "./pages/admin/publidoor/PublidoorSettings";

// Publidoor Partner Pages
import PartnerLogin from "./pages/partner/publidoor/PartnerLogin";
import PartnerLayout from "./pages/partner/publidoor/PartnerLayout";
import PartnerVitrine from "./pages/partner/publidoor/PartnerVitrine";
import PartnerEditor from "./pages/partner/publidoor/PartnerEditor";
import PartnerAgenda from "./pages/partner/publidoor/PartnerAgenda";
import PartnerMetricsPage from "./pages/partner/publidoor/PartnerMetrics";
import PartnerBusiness from "./pages/partner/publidoor/PartnerBusiness";
import PartnerPlan from "./pages/partner/publidoor/PartnerPlan";

// Conexão.AI Pages
import ConexaoAIDashboard from "./pages/admin/conexao-ai/ConexaoAIDashboard";
import ConexaoAIAssistant from "./pages/admin/conexao-ai/ConexaoAIAssistant";
import ConexaoAICreator from "./pages/admin/conexao-ai/ConexaoAICreator";
import ConexaoAITools from "./pages/admin/conexao-ai/ConexaoAITools";
import ConexaoAIAutomations from "./pages/admin/conexao-ai/ConexaoAIAutomations";
import ConexaoAIInsights from "./pages/admin/conexao-ai/ConexaoAIInsights";

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
import JobAlertsPage from "./pages/community/JobAlertsPage";
// Campaign Pages
import GoogleMapsCampaign from "./pages/campaigns/GoogleMapsCampaign";
import WebRadioTVCampaign from "./pages/campaigns/WebRadioTVCampaign";
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

// Classifieds Pages
import ClassifiedsPage from "./pages/classifieds/ClassifiedsPage";
import ClassifiedDetailPage from "./pages/classifieds/ClassifiedDetailPage";
import ClassifiedNewPage from "./pages/classifieds/ClassifiedNewPage";
import ClassifiedsAdmin from "./pages/admin/ClassifiedsAdmin";

// Jobs Pages
import JobsPage from "./pages/jobs/JobsPage";
import JobDetailPage from "./pages/jobs/JobDetailPage";
import JobsAdmin from "./pages/admin/JobsAdmin";

// Broadcast Pages
import BroadcastHub from "./pages/broadcast/BroadcastHub";
import BroadcastWatch from "./pages/broadcast/BroadcastWatch";
import BroadcastSchedule from "./pages/broadcast/BroadcastSchedule";
import BroadcastArchive from "./pages/broadcast/BroadcastArchive";
import GuestJoin from "./pages/broadcast/GuestJoin";
import LiveStudioPromo from "./pages/broadcast/LiveStudioPromo";
import WebRadioTVAccess from "./pages/broadcast/WebRadioTVAccess";
import BroadcastDashboard from "./pages/admin/broadcast/BroadcastDashboard";
import BroadcastList from "./pages/admin/broadcast/BroadcastList";
import BroadcastForm from "./pages/admin/broadcast/BroadcastForm";
import BroadcastChannels from "./pages/admin/broadcast/BroadcastChannels";
import BroadcastPrograms from "./pages/admin/broadcast/BroadcastPrograms";
import BroadcastStudio from "./pages/admin/broadcast/BroadcastStudio";
import BroadcastPlaylist from "./pages/admin/broadcast/BroadcastPlaylist";
import BroadcastVideoPlaylist from "./pages/admin/broadcast/BroadcastVideoPlaylist";

// Conexão Studio Pages
import ConexaoStudioDashboard from "./pages/conexao-studio/Dashboard";
import ConexaoStudioList from "./pages/conexao-studio/StudioList";
import ConexaoStudioCreate from "./pages/conexao-studio/StudioCreate";
import ConexaoStudioLibrary from "./pages/conexao-studio/Library";
import ConexaoStudioDestinations from "./pages/conexao-studio/Destinations";
import ConexaoStudioWebinars from "./pages/conexao-studio/Webinars";
import ConexaoStudioBranding from "./pages/conexao-studio/Branding";
import ConexaoStudioTeam from "./pages/conexao-studio/Team";
import ConexaoStudioSession from "./pages/conexao-studio/StudioSession";
import ConexaoStudioGuestEntry from "./pages/conexao-studio/GuestEntry";

// Conexão Stream (Central Hub)
import ConexaoStream from "./pages/admin/ConexaoStream";

// Streaming Config Pages
import StreamingRadioConfig from "./pages/admin/streaming/StreamingRadioConfig";
import StreamingTvConfig from "./pages/admin/streaming/StreamingTvConfig";

// Public Streaming Pages
import RadioPage from "./pages/public/RadioPage";
import TvPage from "./pages/public/TvPage";

// Rádio Web Pages
import {
  RadioOverview,
  RadioStatus,
  RadioEncoder,
  RadioAutoDJ,
  RadioLibrary,
  RadioStats,
  RadioPlayers,
  RadioSettings,
} from "./modules/radio/pages";

// TV Web Pages
import {
  TvOverview,
  TvLive,
  TvSchedule,
  TvVod,
  TvUploads,
  TvStats,
  TvPlayers,
  TvSettings,
} from "./modules/tv/pages";

// Template Settings Pages
import TemplateSelector from "./pages/admin/settings/TemplateSelector";
import VocabularyEditor from "./pages/admin/settings/VocabularyEditor";
import ModulesManager from "./pages/admin/settings/ModulesManager";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <SiteThemeProvider>
            <AccessibilityProvider>
              <NewsCreationProvider>
                <NewsCreationModalProvider>
                  <MiniPlayerProvider>
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
                        <Route path="/web-radio-tv" element={<WebRadioTVCampaign />} />
                        <Route path="/campanha/radio-tv" element={<WebRadioTVCampaign />} />
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
                        
                        {/* Classifieds Routes */}
                        <Route path="/classificados" element={<ClassifiedsPage />} />
                        <Route path="/classificados/novo" element={<ClassifiedNewPage />} />
                        <Route path="/classificados/:id" element={<ClassifiedDetailPage />} />
                        
                        {/* Jobs Routes */}
                        <Route path="/empregos" element={<JobsPage />} />
                        <Route path="/empregos/:id" element={<JobDetailPage />} />
                        
                        {/* Job Alerts */}
                        <Route path="/comunidade/alertas-vagas" element={<JobAlertsPage />} />
                      </Route>
                      <Route path="/story/:slug" element={<StoryViewer />} />
                      <Route path="/evento/:slug" element={<EventDetail />} />
                      <Route path="/edicao/:slug" element={<EditionViewer />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth-comunidade" element={<CommunityAuth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/login" element={<Navigate to="/auth" replace />} />
                      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
                      
                      {/* Public Streaming Pages */}
                      <Route path="/radio" element={<RadioPage />} />
                      <Route path="/tv" element={<TvPage />} />
                      
                      {/* Studio Guest Entry */}
                      <Route path="/studio/join/:token" element={<ConexaoStudioGuestEntry />} />

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
                        <Route path="reading-analytics" element={<ReadingAnalytics />} />
                        <Route path="commercial-reports" element={<CommercialReports />} />
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
                        <Route path="sso-monitor" element={<SsoMonitor />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="settings/template" element={<TemplateSelector />} />
                        <Route path="settings/vocabulary" element={<VocabularyEditor />} />
                        <Route path="settings/modules" element={<ModulesManager />} />
                        <Route path="solutions" element={<Solutions />} />
                        <Route path="events" element={<EventsList />} />
                        <Route path="editions" element={<EditionsList />} />
                        <Route path="editions/new" element={<EditionEditor />} />
                        <Route path="editions/:id/edit" element={<EditionEditor />} />
                        <Route path="financial" element={<FinancialDashboard />} />
                        <Route path="financial/profiles" element={<FinancialProfiles />} />
                        <Route path="financial/receivables" element={<FinancialReceivables />} />
                        <Route path="financial/invoices" element={<FinancialInvoices />} />
                        {/* Redirects para rotas antigas de treinamento */}
                        <Route path="training" element={<Navigate to="/admin/academy" replace />} />
                        <Route path="training/*" element={<Navigate to="/admin/academy" replace />} />
                        <Route path="universidade" element={<Navigate to="/admin/academy" replace />} />
                        <Route path="treinamento" element={<Navigate to="/admin/academy" replace />} />
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
                        
                        {/* Conexão Academy Routes */}
                        <Route path="academy" element={<AcademyDashboard />} />
                        <Route path="academy/curso/:slug" element={<AcademyCourse />} />
                        <Route path="academy/aula/:id" element={<AcademyLesson />} />
                        <Route path="academy/admin/categorias" element={<AcademyAdminCategories />} />
                        <Route path="academy/admin/cursos" element={<AcademyAdminCourses />} />
                        <Route path="academy/admin/cursos/:id/aulas" element={<AcademyAdminLessons />} />
                        
                        {/* Publidoor Routes */}
                        <Route path="publidoor" element={<PublidoorDashboard />} />
                        <Route path="publidoor/criar" element={<PublidoorCreate />} />
                        <Route path="publidoor/:id/editar" element={<PublidoorEdit />} />
                        <Route path="publidoor/campanhas" element={<PublidoorCampaigns />} />
                        <Route path="publidoor/locais" element={<PublidoorLocations />} />
                        <Route path="publidoor/agenda" element={<PublidoorSchedules />} />
                        <Route path="publidoor/anunciantes" element={<PublidoorAdvertisers />} />
                        <Route path="publidoor/metricas" element={<PublidoorMetrics />} />
                        <Route path="publidoor/modelos" element={<PublidoorTemplates />} />
                        <Route path="publidoor/aprovacoes" element={<PublidoorApprovals />} />
                        <Route path="publidoor/config" element={<PublidoorSettings />} />
                        
                        {/* Conexão.AI Routes */}
                        <Route path="conexao-ai" element={<ConexaoAIDashboard />} />
                        <Route path="conexao-ai/assistente" element={<ConexaoAIAssistant />} />
                        <Route path="conexao-ai/criador" element={<ConexaoAICreator />} />
                        <Route path="conexao-ai/ferramentas" element={<ConexaoAITools />} />
                        <Route path="conexao-ai/automacoes" element={<ConexaoAIAutomations />} />
                        <Route path="conexao-ai/insights" element={<ConexaoAIInsights />} />
                        
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
                        
                        {/* Conexão Stream Hub (Central) */}
                        <Route path="stream" element={<ConexaoStream />} />
                        
                        {/* Broadcast Admin Routes */}
                        <Route path="broadcast" element={<BroadcastDashboard />} />
                        <Route path="broadcast/list" element={<BroadcastList />} />
                        <Route path="broadcast/new" element={<BroadcastForm />} />
                        <Route path="broadcast/:id/edit" element={<BroadcastForm />} />
                        <Route path="broadcast/channels" element={<BroadcastChannels />} />
                        <Route path="broadcast/programs" element={<BroadcastPrograms />} />
                        <Route path="broadcast/playlist" element={<BroadcastPlaylist />} />
                        <Route path="broadcast/videos" element={<BroadcastVideoPlaylist />} />
                        <Route path="broadcast/studio/:id" element={<BroadcastStudio />} />
                        
                        {/* Conexão Studio Admin Routes */}
                        <Route path="conexao-studio" element={<ConexaoStudioDashboard />} />
                        <Route path="conexao-studio/studios" element={<ConexaoStudioList />} />
                        <Route path="conexao-studio/studios/new" element={<ConexaoStudioCreate />} />
                        <Route path="conexao-studio/studios/:slug/session" element={<ConexaoStudioSession />} />
                        <Route path="conexao-studio/library" element={<ConexaoStudioLibrary />} />
                        <Route path="conexao-studio/destinations" element={<ConexaoStudioDestinations />} />
                        <Route path="conexao-studio/webinars" element={<ConexaoStudioWebinars />} />
                        <Route path="conexao-studio/branding" element={<ConexaoStudioBranding />} />
                        <Route path="conexao-studio/team" element={<ConexaoStudioTeam />} />
                        
                        {/* Rádio Web Admin Routes */}
                        <Route path="radio" element={<RadioOverview />} />
                        <Route path="radio/status" element={<RadioStatus />} />
                        <Route path="radio/encoder" element={<RadioEncoder />} />
                        <Route path="radio/autodj" element={<RadioAutoDJ />} />
                        <Route path="radio/library" element={<RadioLibrary />} />
                        <Route path="radio/stats" element={<RadioStats />} />
                        <Route path="radio/players" element={<RadioPlayers />} />
                        <Route path="radio/settings" element={<RadioSettings />} />
                        
                        {/* TV Web Admin Routes */}
                        <Route path="tv" element={<TvOverview />} />
                        <Route path="tv/live" element={<TvLive />} />
                        <Route path="tv/schedule" element={<TvSchedule />} />
                        <Route path="tv/vod" element={<TvVod />} />
                        <Route path="tv/uploads" element={<TvUploads />} />
                        <Route path="tv/stats" element={<TvStats />} />
                        <Route path="tv/players" element={<TvPlayers />} />
                        <Route path="tv/settings" element={<TvSettings />} />
                        
                        {/* Streaming Config Routes */}
                        <Route path="streaming/radio" element={<StreamingRadioConfig />} />
                        <Route path="streaming/tv" element={<StreamingTvConfig />} />
                        <Route path="tv/schedule" element={<TvSchedule />} />
                        <Route path="tv/vod" element={<TvVod />} />
                        <Route path="tv/uploads" element={<TvUploads />} />
                        <Route path="tv/stats" element={<TvStats />} />
                        <Route path="tv/players" element={<TvPlayers />} />
                        <Route path="tv/settings" element={<TvSettings />} />
                        
                        {/* Classifieds & Jobs Admin */}
                        <Route path="classifieds" element={<ClassifiedsAdmin />} />
                        <Route path="jobs" element={<JobsAdmin />} />
                      </Route>
                      
                      {/* Broadcast Public Routes - Protected by Module Guard */}
                      <Route path="/ao-vivo" element={
                        <RouteModuleGuard module="lives">
                          <BroadcastHub />
                        </RouteModuleGuard>
                      } />
                      <Route path="/ao-vivo/acesso" element={
                        <RouteModuleGuard module="lives">
                          <WebRadioTVAccess />
                        </RouteModuleGuard>
                      } />
                      <Route path="/ao-vivo/studio" element={
                        <RouteModuleGuard module="lives">
                          <LiveStudioPromo />
                        </RouteModuleGuard>
                      } />
                      <Route path="/ao-vivo/programacao" element={
                        <RouteModuleGuard module="schedule">
                          <BroadcastSchedule />
                        </RouteModuleGuard>
                      } />
                      <Route path="/ao-vivo/arquivo" element={
                        <RouteModuleGuard module="vod">
                          <BroadcastArchive />
                        </RouteModuleGuard>
                      } />
                      <Route path="/ao-vivo/:slug" element={
                        <RouteModuleGuard module="lives">
                          <BroadcastWatch />
                        </RouteModuleGuard>
                      } />
                      <Route path="/join/:inviteToken" element={<GuestJoin />} />

                      {/* Publidoor Partner Routes */}
                      <Route path="/partner/login" element={<PartnerLogin />} />
                      <Route path="/partner" element={<PartnerLayout />}>
                        <Route index element={<Navigate to="/partner/publidoor" replace />} />
                        <Route path="publidoor" element={<PartnerVitrine />} />
                        <Route path="publidoor/editar" element={<PartnerEditor />} />
                        <Route path="publidoor/editar/:id" element={<PartnerEditor />} />
                        <Route path="publidoor/agenda" element={<PartnerAgenda />} />
                        <Route path="publidoor/metricas" element={<PartnerMetricsPage />} />
                        <Route path="publidoor/negocio" element={<PartnerBusiness />} />
                        <Route path="publidoor/plano" element={<PartnerPlan />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MaintenanceGuard>
                </BrowserRouter>
                  </TooltipProvider>
                </MiniPlayerProvider>
              </NewsCreationModalProvider>
            </NewsCreationProvider>
          </AccessibilityProvider>
        </SiteThemeProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
</HelmetProvider>
);

export default App;

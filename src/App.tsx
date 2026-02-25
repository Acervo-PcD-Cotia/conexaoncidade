import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ExitIntentModal } from "@/components/ads/ExitIntentModal";
import { FloatingAd } from "@/components/ads/FloatingAd";
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
import { CampaignErrorBoundary } from "@/components/admin/campaigns/CampaignErrorBoundary";
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
import WebStoryViewerPage from "./pages/public/WebStoryViewer";

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
import NewsAnalytics from "./pages/admin/NewsAnalytics";
import WeeklyReport from "./pages/admin/WeeklyReport";
import CommercialReports from "./pages/admin/CommercialReports";
import AuditLogs from "./pages/admin/AuditLogs";
import AdDiagnostics from "./pages/admin/AdDiagnostics";
import SsoMonitor from "./pages/admin/SsoMonitor";
import Settings from "./pages/admin/Settings";
import NoticiasAI from "./pages/admin/NoticiasAI";
import SocialDashboard from "./pages/admin/SocialDashboard";
import SocialQueue from "./pages/admin/SocialQueue";
import SocialHistory from "./pages/admin/SocialHistory";
import SocialLogs from "./pages/admin/SocialLogs";
import SocialSettings from "./pages/admin/SocialSettings";
import { PostSocialDashboard, PostSocialSettings, PostSocialComposer } from "./pages/admin/postsocial";
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
import PushNotificationsAdmin from "./pages/admin/PushNotificationsAdmin";

// Campaign Proofs Module
import CampaignProofsList from "./pages/admin/comprovantes/CampaignProofsList";
import CampaignProofEditor from "./pages/admin/comprovantes/CampaignProofEditor";

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
// Auto Post Regional Pages (Independent Module)
import { 
  RegionalDashboard, 
  RegionalSources, 
  RegionalQueue, 
  RegionalLogs,
  RegionalSourceEdit,
} from "./pages/admin/autopost-regional";

// Content Fix Module
import {
  ContentFixDashboard,
  ImageFixer,
  DateFixer,
  ContentValidator,
  ContentFixer,
  TitleFixer,
} from "./modules/content-fix/pages";

// Conexão Academy Pages
import AcademyDashboard from "./pages/admin/academy/AcademyDashboard";
import AcademyCourse from "./pages/admin/academy/AcademyCourse";
import AcademyLesson from "./pages/admin/academy/AcademyLesson";
import AcademyAdminCategories from "./pages/admin/academy/AcademyAdminCategories";
import AcademyAdminCourses from "./pages/admin/academy/AcademyAdminCourses";
import AcademyAdminLessons from "./pages/admin/academy/AcademyAdminLessons";

// ENEM 2026 Pages
import AcademyEnem from "./pages/admin/academy/AcademyEnem";
import EnemModule from "./pages/admin/academy/EnemModule";
import EnemWeek from "./pages/admin/academy/EnemWeek";
import EnemLessonPage from "./pages/admin/academy/EnemLesson";
import EnemSubmissions from "./pages/admin/academy/EnemSubmissions";
import EnemSubmissionDetail from "./pages/admin/academy/EnemSubmissionDetail";

// Esportes Pages
import EsportesDashboard from "./pages/admin/esportes/EsportesDashboard";
import BrasileiraoHome from "./pages/admin/esportes/BrasileiraoHome";
import EsportesEstatisticas from "./pages/admin/esportes/EsportesEstatisticas";
import EsportesConfig from "./pages/admin/esportes/EsportesConfig";
import BrasileiraoSync from "./pages/admin/esportes/BrasileiraoSync";
import BrasileiraoBroadcasts from "./pages/admin/esportes/BrasileiraoBroadcasts";
import BrasileiraoNews from "./pages/admin/esportes/BrasileiraoNews";

// Public Esportes Pages
import BrasileiraoPage from "./pages/public/esportes/BrasileiraoPage";
import SerieDetailPage from "./pages/public/esportes/SerieDetailPage";
import MatchDetailPage from "./pages/public/esportes/MatchDetailPage";
import TeamDetailPage from "./pages/public/esportes/TeamDetailPage";
import RoundPage from "./pages/public/esportes/RoundPage";
import TopScorersPage from "./pages/public/esportes/TopScorersPage";
import GeneratedNewsDetail from "./pages/public/esportes/GeneratedNewsDetail";

// Public ENEM 2026 Page
import Enem2026Landing from "./pages/public/Enem2026Landing";

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
import CampaignsUnified from "./pages/admin/campaigns/CampaignsUnified";
import CampaignEditor from "./pages/admin/campaigns/CampaignEditor";
import CampaignMetrics from "./pages/admin/campaigns/CampaignMetrics";
import CampaignsTutorial from "./pages/admin/campaigns/CampaignsTutorial";
import MediaKit from "./pages/admin/campaigns/MediaKit";

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

// Real Estate Module
import { 
  ImoveisListPage, 
  ImovelDetailPage, 
  AnuncianteProfilePage, 
  ImoveisCidadePage, 
  ImoveisBairroPage, 
  CorretoresListPage 
} from "./modules/imoveis/pages";

// Guia Comercial Module
import { 
  GuiaComercialPage, 
  BusinessDetailPage, 
  GuiaCadastrarPage,
  GuiaCategoriaPage,
  GuiaCidadePage,
  GuiaPlanosPage,
  GuiaAnuncianteDashboard,
  GuiaAnuncianteLeads,
  GuiaAnuncianteEditar,
} from "./pages/guia";
import ImoveisAdmin from "./pages/admin/imoveis/ImoveisAdmin";
import ImovelEditor from "./pages/admin/imoveis/ImovelEditor";
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
import AppearanceSettings from "./pages/admin/settings/AppearanceSettings";
import MenuToggleSettings from "./pages/admin/settings/MenuToggleSettings";
import BrandingLogoSettings from "./pages/admin/settings/BrandingLogoSettings";
import AIProviderSettings from "./pages/admin/settings/AIProviderSettings";

import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes — data rarely changes mid-session
      gcTime: 15 * 60 * 1000,     // 15 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
                    <ExitIntentModal />
                    <FloatingAd />
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
                        
                        {/* Real Estate Routes */}
                        <Route path="/imoveis" element={<ImoveisListPage />} />
                        <Route path="/imoveis/:slug" element={<ImovelDetailPage />} />
                        <Route path="/imoveis/corretor/:slug" element={<AnuncianteProfilePage />} />
                        <Route path="/imoveis/corretores" element={<CorretoresListPage />} />
                        <Route path="/imoveis/cidade/:cidade" element={<ImoveisCidadePage />} />
                        <Route path="/imoveis/cidade/:cidade/bairro/:bairro" element={<ImoveisBairroPage />} />
                        
                        {/* Guia Comercial Routes */}
                        <Route path="/guia" element={<GuiaComercialPage />} />
                        <Route path="/guia/cadastrar" element={<GuiaCadastrarPage />} />
                        <Route path="/guia/planos" element={<GuiaPlanosPage />} />
                        <Route path="/guia/categoria/:slug" element={<GuiaCategoriaPage />} />
                        <Route path="/guia/cidade/:cidade" element={<GuiaCidadePage />} />
                        <Route path="/guia/:slug" element={<BusinessDetailPage />} />
                        <Route path="/guia/anunciante" element={<GuiaAnuncianteDashboard />} />
                        <Route path="/guia/anunciante/leads" element={<GuiaAnuncianteLeads />} />
                        <Route path="/guia/anunciante/editar/:id" element={<GuiaAnuncianteEditar />} />
                        
                        {/* ENEM 2026 Public Landing */}
                        <Route path="/enem-2026" element={<Enem2026Landing />} />
                      </Route>
                      <Route path="/story/:slug" element={<StoryViewer />} />
                      <Route path="/webstory/:campaignId" element={<WebStoryViewerPage />} />
                      <Route path="/evento/:slug" element={<EventDetail />} />
                      <Route path="/edicao/:slug" element={<EditionViewer />} />
                      <Route path="/spah" element={<Auth />} />
                      <Route path="/auth-comunidade" element={<CommunityAuth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                       
                      {/* Public Streaming Pages */}
                      <Route path="/radio" element={
                        <RouteModuleGuard module="web_radio">
                          <RadioPage />
                        </RouteModuleGuard>
                      } />
                      <Route path="/tv" element={
                        <RouteModuleGuard module="web_tv">
                          <TvPage />
                        </RouteModuleGuard>
                      } />
                      
                      {/* Public Esportes Routes */}
                      <Route path="/esportes/brasileirao" element={<BrasileiraoPage />} />
                      <Route path="/esportes/brasileirao/noticia/:slug" element={<GeneratedNewsDetail />} />
                      <Route path="/esportes/brasileirao/:serie" element={<SerieDetailPage />} />
                      <Route path="/esportes/brasileirao/:serie/rodada/:round" element={<RoundPage />} />
                      <Route path="/esportes/brasileirao/:serie/jogo/:slug" element={<MatchDetailPage />} />
                      <Route path="/esportes/brasileirao/:serie/time/:slug" element={<TeamDetailPage />} />
                      <Route path="/esportes/brasileirao/:serie/estatisticas/artilharia" element={<TopScorersPage />} />
                      
                      {/* Studio Guest Entry */}
                      <Route path="/studio/join/:token" element={<ConexaoStudioGuestEntry />} />

                      {/* Admin Routes */}
                      <Route path="/spah/painel" element={<AdminLayout />}>
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
                        <Route path="noticias/:id" element={<NewsAnalytics />} />
                        <Route path="relatorio-semanal" element={<WeeklyReport />} />
                        <Route path="commercial-reports" element={<CommercialReports />} />
                        <Route path="analytics/leitura" element={<ReadingAnalytics />} />
                        <Route path="social" element={<SocialDashboard />} />
                        <Route path="social/queue" element={<SocialQueue />} />
                        <Route path="social/history" element={<SocialHistory />} />
                        <Route path="social/logs" element={<SocialLogs />} />
                        <Route path="social/settings" element={<SocialSettings />} />
                        
                        {/* PostSocial Module (New) */}
                        <Route path="postsocial" element={<PostSocialDashboard />} />
                        <Route path="postsocial/new" element={<PostSocialComposer />} />
                        <Route path="postsocial/:id" element={<PostSocialComposer />} />
                        <Route path="postsocial/settings" element={<PostSocialSettings />} />
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
                        <Route path="settings/menus" element={<MenuToggleSettings />} />
                        <Route path="settings/appearance" element={<AppearanceSettings />} />
                        <Route path="settings/logo" element={<BrandingLogoSettings />} />
                        <Route path="settings/ai-providers" element={<AIProviderSettings />} />
                        <Route path="solutions" element={<Solutions />} />
                        <Route path="notificacoes" element={<PushNotificationsAdmin />} />
                        <Route path="events" element={<EventsList />} />
                        <Route path="editions" element={<EditionsList />} />
                        <Route path="editions/new" element={<EditionEditor />} />
                        <Route path="editions/:id/edit" element={<EditionEditor />} />
                        <Route path="financial" element={<FinancialDashboard />} />
                        <Route path="financial/profiles" element={<FinancialProfiles />} />
                        <Route path="financial/receivables" element={<FinancialReceivables />} />
                        <Route path="financial/invoices" element={<FinancialInvoices />} />
                        {/* Redirects para rotas antigas de treinamento */}
                        <Route path="training" element={<Navigate to="/spah/painel/academy" replace />} />
                        <Route path="training/*" element={<Navigate to="/spah/painel/academy" replace />} />
                        <Route path="universidade" element={<Navigate to="/spah/painel/academy" replace />} />
                        <Route path="treinamento" element={<Navigate to="/spah/painel/academy" replace />} />
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
                        
                        {/* Auto Post Regional (Grande Cotia) - Módulo Independente */}
                        <Route path="autopost-regional" element={<RegionalDashboard />} />
                        <Route path="autopost-regional/fontes" element={<RegionalSources />} />
                        <Route path="autopost-regional/fontes/:id/edit" element={<RegionalSourceEdit />} />
                        <Route path="autopost-regional/fila" element={<RegionalQueue />} />
                        <Route path="autopost-regional/logs" element={<RegionalLogs />} />
                        
                        {/* Content Fix Module */}
                        <Route path="content-fix" element={<ContentFixDashboard />} />
                        <Route path="content-fix/images" element={<ImageFixer />} />
                        <Route path="content-fix/dates" element={<DateFixer />} />
                        <Route path="content-fix/validator" element={<ContentValidator />} />
                        <Route path="content-fix/content" element={<ContentFixer />} />
                        <Route path="content-fix/titles" element={<TitleFixer />} />
                        
                        {/* Conexão Academy Routes */}
                        <Route path="academy" element={<AcademyDashboard />} />
                        <Route path="academy/curso/:slug" element={<AcademyCourse />} />
                        <Route path="academy/aula/:id" element={<AcademyLesson />} />
                        <Route path="academy/admin/categorias" element={<AcademyAdminCategories />} />
                        <Route path="academy/admin/cursos" element={<AcademyAdminCourses />} />
                        <Route path="academy/admin/cursos/:id/aulas" element={<AcademyAdminLessons />} />
                        
                        {/* ENEM 2026 Routes */}
                        <Route path="academy/enem" element={<AcademyEnem />} />
                        <Route path="academy/enem/:slug" element={<EnemModule />} />
                        <Route path="academy/enem/:slug/semana/:weekNumber" element={<EnemWeek />} />
                        <Route path="academy/enem/:slug/semana/:weekNumber/aula/:lessonId" element={<EnemLessonPage />} />
                        <Route path="academy/enem/:slug/minhas-redacoes" element={<EnemSubmissions />} />
                        <Route path="academy/enem/:slug/redacao/:submissionId" element={<EnemSubmissionDetail />} />
                        
                        {/* Esportes Routes */}
                        <Route path="esportes" element={<EsportesDashboard />} />
                        <Route path="esportes/brasileirao" element={<BrasileiraoHome />} />
                        <Route path="esportes/brasileirao/sync" element={<BrasileiraoSync />} />
                        <Route path="esportes/brasileirao/transmissoes" element={<BrasileiraoBroadcasts />} />
                        <Route path="esportes/brasileirao/noticias" element={<BrasileiraoNews />} />
                        <Route path="esportes/estatisticas" element={<EsportesEstatisticas />} />
                        <Route path="esportes/configurar" element={<EsportesConfig />} />
                        
                        {/* Campaign Proofs Routes */}
                        <Route path="comprovantes" element={<CampaignProofsList />} />
                        <Route path="comprovantes/:id" element={<CampaignProofEditor />} />
                        
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
                        <Route path="campaigns" element={<CampaignErrorBoundary><CampaignsHub /></CampaignErrorBoundary>} />
                        <Route path="campaigns/google-maps" element={<CampaignErrorBoundary><GoogleMapsLeads /></CampaignErrorBoundary>} />
                        <Route path="campaigns/unified" element={<CampaignErrorBoundary><CampaignsUnified /></CampaignErrorBoundary>} />
                        <Route path="campaigns/new" element={<CampaignErrorBoundary><CampaignEditor /></CampaignErrorBoundary>} />
                        <Route path="campaigns/edit/:id" element={<CampaignErrorBoundary><CampaignEditor /></CampaignErrorBoundary>} />
                        <Route path="campaigns/metrics/:id" element={<CampaignErrorBoundary><CampaignMetrics /></CampaignErrorBoundary>} />
                        <Route path="campaigns/tutorial" element={<CampaignErrorBoundary><CampaignsTutorial /></CampaignErrorBoundary>} />
                        <Route path="campaigns/media-kit" element={<CampaignErrorBoundary><MediaKit /></CampaignErrorBoundary>} />
                        <Route path="diagnostico-anuncios" element={<AdDiagnostics />} />
                        
                        {/* Transporte Escolar Admin Routes */}
                        <Route path="transporte-escolar" element={<TransporteEscolarAdmin />} />
                        <Route path="transporte-escolar/escolas" element={<EscolasAdmin />} />
                        <Route path="transporte-escolar/transportadores" element={<TransportadoresAdmin />} />
                        <Route path="transporte-escolar/leads" element={<LeadsAdmin />} />
                        <Route path="transporte-escolar/reports" element={<ReportsAdmin />} />
                        
                        {/* Censo PcD Admin Routes */}
                        <Route path="censo-pcd" element={<CensoPcdDashboard />} />
                        <Route path="censo-pcd/respostas" element={<CensoPcdRespostas />} />
                        
                        {/* Imóveis Admin Routes */}
                        <Route path="imoveis" element={<ImoveisAdmin />} />
                        <Route path="imoveis/novo" element={<ImovelEditor />} />
                        <Route path="imoveis/:id/editar" element={<ImovelEditor />} />
                        
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
    </ThemeProvider>
  </QueryClientProvider>
</HelmetProvider>
);

export default App;

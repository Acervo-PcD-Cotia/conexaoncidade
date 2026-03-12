import { lazy, Suspense } from "react";
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
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Eager: critical path (home + layout shells) ────────────────────────────
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ─── Route-level loading fallback ───────────────────────────────────────────
const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Skeleton className="h-64 w-full max-w-4xl rounded-xl" />
  </div>
);

// ─── Lazy: Public pages ─────────────────────────────────────────────────────
const Auth = lazy(() => import("./pages/Auth"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const StoryViewer = lazy(() => import("./pages/StoryViewer"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const EventosPublic = lazy(() => import("./pages/EventosPublic"));
const AntiFakeNews = lazy(() => import("./pages/AntiFakeNews"));
const EditionViewer = lazy(() => import("./pages/EditionViewer"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NewsListPage = lazy(() => import("./pages/NewsListPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const WebStoryViewerPage = lazy(() => import("./pages/public/WebStoryViewer"));
const VoceNoGoogle = lazy(() => import("./pages/VoceNoGoogle"));
const BusinessCadastro = lazy(() => import("./pages/BusinessCadastro"));

// ─── Lazy: Admin pages ──────────────────────────────────────────────────────
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const NewsList = lazy(() => import("./pages/admin/NewsList"));
const NewsEditor = lazy(() => import("./pages/admin/NewsEditor"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Tags = lazy(() => import("./pages/admin/Tags"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const Ads = lazy(() => import("./pages/admin/Ads"));
const StoriesList = lazy(() => import("./pages/admin/StoriesList"));
const StoryEditor = lazy(() => import("./pages/admin/StoryEditor"));
const Users = lazy(() => import("./pages/admin/Users"));
const TenantManagement = lazy(() => import("./pages/admin/TenantManagement"));
const HomeEditor = lazy(() => import("./pages/admin/HomeEditor"));
const QuickNotesAdmin = lazy(() => import("./pages/admin/QuickNotesAdmin"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const ReadingAnalytics = lazy(() => import("./pages/admin/ReadingAnalytics"));
const NewsAnalytics = lazy(() => import("./pages/admin/NewsAnalytics"));
const WeeklyReport = lazy(() => import("./pages/admin/WeeklyReport"));
const CommercialReports = lazy(() => import("./pages/admin/CommercialReports"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdDiagnostics = lazy(() => import("./pages/admin/AdDiagnostics"));
const AdInventorySimulator = lazy(() => import("./pages/admin/AdInventorySimulator"));
const SsoMonitor = lazy(() => import("./pages/admin/SsoMonitor"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const NoticiasAI = lazy(() => import("./pages/admin/NoticiasAI"));
const NewsImport = lazy(() => import("./pages/admin/NewsImport"));
const InstagramGenerator = lazy(() => import("./pages/admin/InstagramGenerator"));
const RelatorioTXT = lazy(() => import("./pages/admin/RelatorioTXT"));
const SocialDashboard = lazy(() => import("./pages/admin/SocialDashboard"));
const SocialQueue = lazy(() => import("./pages/admin/SocialQueue"));
const SocialHistory = lazy(() => import("./pages/admin/SocialHistory"));
const SocialLogs = lazy(() => import("./pages/admin/SocialLogs"));
const SocialSettings = lazy(() => import("./pages/admin/SocialSettings"));
const LinksDashboard = lazy(() => import("./pages/admin/LinksDashboard"));
const LinksBuilder = lazy(() => import("./pages/admin/LinksBuilder"));
const Solutions = lazy(() => import("./pages/admin/Solutions"));
const EventsList = lazy(() => import("./pages/admin/EventsList"));
const EditionsList = lazy(() => import("./pages/admin/EditionsList"));
const EditionEditor = lazy(() => import("./pages/admin/EditionEditor"));
const FinancialDashboard = lazy(() => import("./pages/admin/FinancialDashboard"));
const FinancialProfiles = lazy(() => import("./pages/admin/FinancialProfiles"));
const FinancialReceivables = lazy(() => import("./pages/admin/FinancialReceivables"));
const FinancialInvoices = lazy(() => import("./pages/admin/FinancialInvoices"));
const PodcastsList = lazy(() => import("./pages/admin/PodcastsList"));
const AntiFakeNewsAdmin = lazy(() => import("./pages/admin/AntiFakeNewsAdmin"));
const LinksQRGenerator = lazy(() => import("./pages/admin/LinksQRGenerator"));
const LinksBioBuilder = lazy(() => import("./pages/admin/LinksBioBuilder"));
const LinksReports = lazy(() => import("./pages/admin/LinksReports"));
const CampaignsHub = lazy(() => import("./pages/admin/CampaignsHub"));
const PushNotificationsAdmin = lazy(() => import("./pages/admin/PushNotificationsAdmin"));
const ClassifiedsAdmin = lazy(() => import("./pages/admin/ClassifiedsAdmin"));
const JobsAdmin = lazy(() => import("./pages/admin/JobsAdmin"));
const ConexaoStream = lazy(() => import("./pages/admin/ConexaoStream"));

// PostSocial
const PostSocialModule = lazy(() => import("./pages/admin/postsocial").then(m => ({
  default: () => null // placeholder, real components below
})));
const PostSocialDashboard = lazy(() => import("./pages/admin/postsocial").then(m => ({ default: m.PostSocialDashboard })));
const PostSocialSettings = lazy(() => import("./pages/admin/postsocial").then(m => ({ default: m.PostSocialSettings })));
const PostSocialComposer = lazy(() => import("./pages/admin/postsocial").then(m => ({ default: m.PostSocialComposer })));
const PostSocialPlatformSetup = lazy(() => import("./pages/admin/postsocial").then(m => ({ default: m.PostSocialPlatformSetup })));

// Campaign Proofs
const CampaignProofsList = lazy(() => import("./pages/admin/comprovantes/CampaignProofsList"));
const CampaignProofEditor = lazy(() => import("./pages/admin/comprovantes/CampaignProofEditor"));
const CampaignErrorBoundary = lazy(() => import("./components/admin/campaigns/CampaignErrorBoundary").then(m => ({ default: m.CampaignErrorBoundary })));

// Auto Post PRO
const AutoPostDashboard = lazy(() => import("./pages/admin/autopost/AutoPostDashboard"));
const AutoPostSources = lazy(() => import("./pages/admin/autopost/AutoPostSources"));
const AutoPostQueue = lazy(() => import("./pages/admin/autopost/AutoPostQueue"));
const AutoPostGroups = lazy(() => import("./pages/admin/autopost/AutoPostGroups"));
const AutoPostRules = lazy(() => import("./pages/admin/autopost/AutoPostRules"));
const AutoPostSchedules = lazy(() => import("./pages/admin/autopost/AutoPostSchedules"));
const AutoPostMedia = lazy(() => import("./pages/admin/autopost/AutoPostMedia"));
const AutoPostDuplicates = lazy(() => import("./pages/admin/autopost/AutoPostDuplicates"));
const AutoPostLogs = lazy(() => import("./pages/admin/autopost/AutoPostLogs"));
const AutoPostReports = lazy(() => import("./pages/admin/autopost/AutoPostReports"));
const AutoPostSettings = lazy(() => import("./pages/admin/autopost/AutoPostSettings"));
const AutoPostSourceForm = lazy(() => import("./pages/admin/autopost/AutoPostSourceForm"));

// Auto Post Regional
const RegionalDashboard = lazy(() => import("./pages/admin/autopost-regional").then(m => ({ default: m.RegionalDashboard })));
const RegionalSources = lazy(() => import("./pages/admin/autopost-regional").then(m => ({ default: m.RegionalSources })));
const RegionalQueue = lazy(() => import("./pages/admin/autopost-regional").then(m => ({ default: m.RegionalQueue })));
const RegionalLogs = lazy(() => import("./pages/admin/autopost-regional").then(m => ({ default: m.RegionalLogs })));
const RegionalSourceEdit = lazy(() => import("./pages/admin/autopost-regional").then(m => ({ default: m.RegionalSourceEdit })));

// Content Fix
const ContentFixDashboard = lazy(() => import("./modules/content-fix/pages").then(m => ({ default: m.ContentFixDashboard })));
const ImageFixer = lazy(() => import("./modules/content-fix/pages").then(m => ({ default: m.ImageFixer })));
const DateFixer = lazy(() => import("./modules/content-fix/pages").then(m => ({ default: m.DateFixer })));
const ContentValidator = lazy(() => import("./modules/content-fix/pages").then(m => ({ default: m.ContentValidator })));
const ContentFixer = lazy(() => import("./modules/content-fix/pages").then(m => ({ default: m.ContentFixer })));
const TitleFixer = lazy(() => import("./modules/content-fix/pages").then(m => ({ default: m.TitleFixer })));

// Academy
const AcademyDashboard = lazy(() => import("./pages/admin/academy/AcademyDashboard"));
const AcademyCourse = lazy(() => import("./pages/admin/academy/AcademyCourse"));
const AcademyLesson = lazy(() => import("./pages/admin/academy/AcademyLesson"));
const AcademyAdminCategories = lazy(() => import("./pages/admin/academy/AcademyAdminCategories"));
const AcademyAdminCourses = lazy(() => import("./pages/admin/academy/AcademyAdminCourses"));
const AcademyAdminLessons = lazy(() => import("./pages/admin/academy/AcademyAdminLessons"));

// ENEM 2026
const AcademyEnem = lazy(() => import("./pages/admin/academy/AcademyEnem"));
const EnemModule = lazy(() => import("./pages/admin/academy/EnemModule"));
const EnemWeek = lazy(() => import("./pages/admin/academy/EnemWeek"));
const EnemLessonPage = lazy(() => import("./pages/admin/academy/EnemLesson"));
const EnemSubmissions = lazy(() => import("./pages/admin/academy/EnemSubmissions"));
const EnemSubmissionDetail = lazy(() => import("./pages/admin/academy/EnemSubmissionDetail"));
const Enem2026Landing = lazy(() => import("./pages/public/Enem2026Landing"));

// Esportes
const EsportesDashboard = lazy(() => import("./pages/admin/esportes/EsportesDashboard"));
const BrasileiraoHome = lazy(() => import("./pages/admin/esportes/BrasileiraoHome"));
const EsportesEstatisticas = lazy(() => import("./pages/admin/esportes/EsportesEstatisticas"));
const EsportesConfig = lazy(() => import("./pages/admin/esportes/EsportesConfig"));
const BrasileiraoSync = lazy(() => import("./pages/admin/esportes/BrasileiraoSync"));
const BrasileiraoBroadcasts = lazy(() => import("./pages/admin/esportes/BrasileiraoBroadcasts"));
const BrasileiraoNews = lazy(() => import("./pages/admin/esportes/BrasileiraoNews"));
const BrasileiraoPage = lazy(() => import("./pages/public/esportes/BrasileiraoPage"));
const SerieDetailPage = lazy(() => import("./pages/public/esportes/SerieDetailPage"));
const MatchDetailPage = lazy(() => import("./pages/public/esportes/MatchDetailPage"));
const TeamDetailPage = lazy(() => import("./pages/public/esportes/TeamDetailPage"));
const RoundPage = lazy(() => import("./pages/public/esportes/RoundPage"));
const TopScorersPage = lazy(() => import("./pages/public/esportes/TopScorersPage"));
const GeneratedNewsDetail = lazy(() => import("./pages/public/esportes/GeneratedNewsDetail"));

// Publidoor
const PublidoorDashboard = lazy(() => import("./pages/admin/publidoor/PublidoorDashboard"));
const PublidoorCreate = lazy(() => import("./pages/admin/publidoor/PublidoorCreate"));
const PublidoorEdit = lazy(() => import("./pages/admin/publidoor/PublidoorEdit"));
const PublidoorCampaigns = lazy(() => import("./pages/admin/publidoor/PublidoorCampaigns"));
const PublidoorLocations = lazy(() => import("./pages/admin/publidoor/PublidoorLocations"));
const PublidoorSchedules = lazy(() => import("./pages/admin/publidoor/PublidoorSchedules"));
const PublidoorAdvertisers = lazy(() => import("./pages/admin/publidoor/PublidoorAdvertisers"));
const PublidoorMetrics = lazy(() => import("./pages/admin/publidoor/PublidoorMetrics"));
const PublidoorTemplates = lazy(() => import("./pages/admin/publidoor/PublidoorTemplates"));
const PublidoorApprovals = lazy(() => import("./pages/admin/publidoor/PublidoorApprovals"));
const PublidoorSettings = lazy(() => import("./pages/admin/publidoor/PublidoorSettings"));

// Publidoor Partner
const PartnerLogin = lazy(() => import("./pages/partner/publidoor/PartnerLogin"));
const PartnerLayout = lazy(() => import("./pages/partner/publidoor/PartnerLayout"));
const PartnerVitrine = lazy(() => import("./pages/partner/publidoor/PartnerVitrine"));
const PartnerEditor = lazy(() => import("./pages/partner/publidoor/PartnerEditor"));
const PartnerAgenda = lazy(() => import("./pages/partner/publidoor/PartnerAgenda"));
const PartnerMetricsPage = lazy(() => import("./pages/partner/publidoor/PartnerMetrics"));
const PartnerBusiness = lazy(() => import("./pages/partner/publidoor/PartnerBusiness"));
const PartnerPlan = lazy(() => import("./pages/partner/publidoor/PartnerPlan"));

// Conexão.AI
const ConexaoAIDashboard = lazy(() => import("./pages/admin/conexao-ai/ConexaoAIDashboard"));
const ConexaoAIAssistant = lazy(() => import("./pages/admin/conexao-ai/ConexaoAIAssistant"));
const ConexaoAICreator = lazy(() => import("./pages/admin/conexao-ai/ConexaoAICreator"));
const ConexaoAITools = lazy(() => import("./pages/admin/conexao-ai/ConexaoAITools"));
const ConexaoAIAutomations = lazy(() => import("./pages/admin/conexao-ai/ConexaoAIAutomations"));
const ConexaoAIInsights = lazy(() => import("./pages/admin/conexao-ai/ConexaoAIInsights"));

// Community
const CommunityHub = lazy(() => import("./pages/community/CommunityHub"));
const CommunityUnlock = lazy(() => import("./pages/community/CommunityUnlock"));
const CommunityAuth = lazy(() => import("./pages/community/CommunityAuth"));
const ChallengesPage = lazy(() => import("./pages/community/ChallengesPage"));
const HowToEarnPoints = lazy(() => import("./pages/community/HowToEarnPoints"));
const MemberProfile = lazy(() => import("./pages/community/MemberProfile"));
const ProfileSettings = lazy(() => import("./pages/community/ProfileSettings"));
const GamificationPage = lazy(() => import("./pages/community/GamificationPage"));
const CommunityMap = lazy(() => import("./pages/community/CommunityMap"));
const RedeDoBem = lazy(() => import("./pages/community/RedeDoBem"));
const CommunityGroups = lazy(() => import("./pages/community/CommunityGroups"));
const CommunityBenefits = lazy(() => import("./pages/community/CommunityBenefits"));
const PhoneChooserPage = lazy(() => import("./pages/community/PhoneChooserPage"));
const JobAlertsPage = lazy(() => import("./pages/community/JobAlertsPage"));

// Partners Admin
const PartnersInbox = lazy(() => import("./pages/admin/partners/PartnersInbox"));
const PartnersManage = lazy(() => import("./pages/admin/partners/PartnersManage"));
const PartnersSources = lazy(() => import("./pages/admin/partners/PartnersSources"));
const PartnersPitches = lazy(() => import("./pages/admin/partners/PartnersPitches"));

// Community Admin
const CommunityAdmin = lazy(() => import("./pages/admin/community/CommunityAdmin"));
const CommunityMembers = lazy(() => import("./pages/admin/community/CommunityMembers"));
const CommunityModeration = lazy(() => import("./pages/admin/community/CommunityModeration"));
const PhoneCatalogAdmin = lazy(() => import("./pages/admin/community/PhoneCatalogAdmin"));
const PhoneOffersReport = lazy(() => import("./pages/admin/community/PhoneOffersReport"));
const PhoneImportAssisted = lazy(() => import("./pages/admin/community/PhoneImportAssisted"));

// Campaigns
const GoogleMapsCampaign = lazy(() => import("./pages/campaigns/GoogleMapsCampaign"));
const FormulaConexaoPage = lazy(() => import("./pages/campaigns/FormulaConexaoPage"));
const RegulamentoCaminhaoPage = lazy(() => import("./pages/campaigns/RegulamentoCaminhaoPage"));
const WebRadioTVCampaign = lazy(() => import("./pages/campaigns/WebRadioTVCampaign"));
const GoogleMapsLeads = lazy(() => import("./pages/admin/campaigns/GoogleMapsLeads"));
const CampaignsUnified = lazy(() => import("./pages/admin/campaigns/CampaignsUnified"));
const CampaignEditor = lazy(() => import("./pages/admin/campaigns/CampaignEditor"));
const CampaignMetrics = lazy(() => import("./pages/admin/campaigns/CampaignMetrics"));
const CampaignsTutorial = lazy(() => import("./pages/admin/campaigns/CampaignsTutorial"));
const MediaKit = lazy(() => import("./pages/admin/campaigns/MediaKit"));

// Transporte Escolar
const TransporteEscolarHome = lazy(() => import("./pages/transporte-escolar/TransporteEscolarHome"));
const TransporteEscolarEncontrar = lazy(() => import("./pages/transporte-escolar/TransporteEscolarEncontrar"));
const TransporteEscolarCadastrar = lazy(() => import("./pages/transporte-escolar/TransporteEscolarCadastrar"));
const TransporteEscolarEscola = lazy(() => import("./pages/transporte-escolar/TransporteEscolarEscola"));
const TransporteEscolarRede = lazy(() => import("./pages/transporte-escolar/TransporteEscolarRede"));
const TransporteEscolarBairro = lazy(() => import("./pages/transporte-escolar/TransporteEscolarBairro"));
const TransporteEscolarAdmin = lazy(() => import("./pages/admin/transporte-escolar/TransporteEscolarAdmin"));
const EscolasAdmin = lazy(() => import("./pages/admin/transporte-escolar/EscolasAdmin"));
const TransportadoresAdmin = lazy(() => import("./pages/admin/transporte-escolar/TransportadoresAdmin"));
const LeadsAdmin = lazy(() => import("./pages/admin/transporte-escolar/LeadsAdmin"));
const ReportsAdmin = lazy(() => import("./pages/admin/transporte-escolar/ReportsAdmin"));

// Censo PcD
const CensoPcdHome = lazy(() => import("./pages/censo-pcd/CensoPcdHome"));
const CensoPcdQuiz = lazy(() => import("./pages/censo-pcd/CensoPcdQuiz"));
const CensoPcdConclusao = lazy(() => import("./pages/censo-pcd/CensoPcdConclusao"));
const CensoPcdDashboard = lazy(() => import("./pages/admin/censo-pcd/CensoPcdDashboard"));
const CensoPcdRespostas = lazy(() => import("./pages/admin/censo-pcd/CensoPcdRespostas"));

// Classifieds
const ClassifiedsPage = lazy(() => import("./pages/classifieds/ClassifiedsPage"));
const ClassifiedDetailPage = lazy(() => import("./pages/classifieds/ClassifiedDetailPage"));
const ClassifiedNewPage = lazy(() => import("./pages/classifieds/ClassifiedNewPage"));

// Jobs
const JobsPage = lazy(() => import("./pages/jobs/JobsPage"));
const JobDetailPage = lazy(() => import("./pages/jobs/JobDetailPage"));

// Real Estate
const ImoveisListPage = lazy(() => import("./modules/imoveis/pages").then(m => ({ default: m.ImoveisListPage })));
const ImovelDetailPage = lazy(() => import("./modules/imoveis/pages").then(m => ({ default: m.ImovelDetailPage })));
const AnuncianteProfilePage = lazy(() => import("./modules/imoveis/pages").then(m => ({ default: m.AnuncianteProfilePage })));
const ImoveisCidadePage = lazy(() => import("./modules/imoveis/pages").then(m => ({ default: m.ImoveisCidadePage })));
const ImoveisBairroPage = lazy(() => import("./modules/imoveis/pages").then(m => ({ default: m.ImoveisBairroPage })));
const CorretoresListPage = lazy(() => import("./modules/imoveis/pages").then(m => ({ default: m.CorretoresListPage })));
const ImoveisAdmin = lazy(() => import("./pages/admin/imoveis/ImoveisAdmin"));
const ImovelEditor = lazy(() => import("./pages/admin/imoveis/ImovelEditor"));

// Guia Comercial
const GuiaComercialPage = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaComercialPage })));
const BusinessDetailPage = lazy(() => import("./pages/guia").then(m => ({ default: m.BusinessDetailPage })));
const GuiaCadastrarPage = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaCadastrarPage })));
const GuiaCategoriaPage = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaCategoriaPage })));
const GuiaCidadePage = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaCidadePage })));
const GuiaPlanosPage = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaPlanosPage })));
const GuiaAnuncianteDashboard = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaAnuncianteDashboard })));
const GuiaAnuncianteLeads = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaAnuncianteLeads })));
const GuiaAnuncianteEditar = lazy(() => import("./pages/guia").then(m => ({ default: m.GuiaAnuncianteEditar })));

// Broadcast
const BroadcastHub = lazy(() => import("./pages/broadcast/BroadcastHub"));
const BroadcastWatch = lazy(() => import("./pages/broadcast/BroadcastWatch"));
const BroadcastSchedule = lazy(() => import("./pages/broadcast/BroadcastSchedule"));
const BroadcastArchive = lazy(() => import("./pages/broadcast/BroadcastArchive"));
const GuestJoin = lazy(() => import("./pages/broadcast/GuestJoin"));
const LiveStudioPromo = lazy(() => import("./pages/broadcast/LiveStudioPromo"));
const WebRadioTVAccess = lazy(() => import("./pages/broadcast/WebRadioTVAccess"));
const BroadcastDashboard = lazy(() => import("./pages/admin/broadcast/BroadcastDashboard"));
const BroadcastList = lazy(() => import("./pages/admin/broadcast/BroadcastList"));
const BroadcastForm = lazy(() => import("./pages/admin/broadcast/BroadcastForm"));
const BroadcastChannels = lazy(() => import("./pages/admin/broadcast/BroadcastChannels"));
const BroadcastPrograms = lazy(() => import("./pages/admin/broadcast/BroadcastPrograms"));
const BroadcastStudio = lazy(() => import("./pages/admin/broadcast/BroadcastStudio"));
const BroadcastPlaylist = lazy(() => import("./pages/admin/broadcast/BroadcastPlaylist"));
const BroadcastVideoPlaylist = lazy(() => import("./pages/admin/broadcast/BroadcastVideoPlaylist"));

// Conexão Studio
const ConexaoStudioDashboard = lazy(() => import("./pages/conexao-studio/Dashboard"));
const ConexaoStudioList = lazy(() => import("./pages/conexao-studio/StudioList"));
const ConexaoStudioCreate = lazy(() => import("./pages/conexao-studio/StudioCreate"));
const ConexaoStudioLibrary = lazy(() => import("./pages/conexao-studio/Library"));
const ConexaoStudioDestinations = lazy(() => import("./pages/conexao-studio/Destinations"));
const ConexaoStudioWebinars = lazy(() => import("./pages/conexao-studio/Webinars"));
const ConexaoStudioBranding = lazy(() => import("./pages/conexao-studio/Branding"));
const ConexaoStudioTeam = lazy(() => import("./pages/conexao-studio/Team"));
const ConexaoStudioSession = lazy(() => import("./pages/conexao-studio/StudioSession"));
const ConexaoStudioGuestEntry = lazy(() => import("./pages/conexao-studio/GuestEntry"));

// Streaming Config
const StreamingRadioConfig = lazy(() => import("./pages/admin/streaming/StreamingRadioConfig"));
const StreamingTvConfig = lazy(() => import("./pages/admin/streaming/StreamingTvConfig"));
const RadioPage = lazy(() => import("./pages/public/RadioPage"));
const TvPage = lazy(() => import("./pages/public/TvPage"));

// Radio/TV Admin
const RadioOverview = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioOverview })));
const RadioStatus = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioStatus })));
const RadioEncoder = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioEncoder })));
const RadioAutoDJ = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioAutoDJ })));
const RadioLibrary = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioLibrary })));
const RadioStats = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioStats })));
const RadioPlayers = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioPlayers })));
const RadioSettings = lazy(() => import("./modules/radio/pages").then(m => ({ default: m.RadioSettings })));
const TvOverview = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvOverview })));
const TvLive = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvLive })));
const TvSchedule = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvSchedule })));
const TvVod = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvVod })));
const TvUploads = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvUploads })));
const TvStats = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvStats })));
const TvPlayers = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvPlayers })));
const TvSettings = lazy(() => import("./modules/tv/pages").then(m => ({ default: m.TvSettings })));

// Template Settings
const TemplateSelector = lazy(() => import("./pages/admin/settings/TemplateSelector"));
const VocabularyEditor = lazy(() => import("./pages/admin/settings/VocabularyEditor"));
const ModulesManager = lazy(() => import("./pages/admin/settings/ModulesManager"));
const AppearanceSettings = lazy(() => import("./pages/admin/settings/AppearanceSettings"));
const MenuToggleSettings = lazy(() => import("./pages/admin/settings/MenuToggleSettings"));
const BrandingLogoSettings = lazy(() => import("./pages/admin/settings/BrandingLogoSettings"));
const AIProviderSettings = lazy(() => import("./pages/admin/settings/AIProviderSettings"));

// Core Engine
const CoreEngineDashboard = lazy(() => import("./pages/admin/core-engine/CoreEngineDashboard"));
const CoreModulePage = lazy(() => import("./pages/admin/core-engine/CoreModulePage"));
const CoreRedirects = lazy(() => import("./pages/admin/core-engine/CoreRedirects"));
const CoreAnalytics = lazy(() => import("./pages/admin/core-engine/CoreAnalytics"));
const CoreSEO = lazy(() => import("./pages/admin/core-engine/CoreSEO"));
const CoreMedia = lazy(() => import("./pages/admin/core-engine/CoreMedia"));
const CorePerformance = lazy(() => import("./pages/admin/core-engine/CorePerformance"));
const CoreLeads = lazy(() => import("./pages/admin/core-engine/CoreLeads"));
const CoreSchema = lazy(() => import("./pages/admin/core-engine/CoreSchema"));
const CoreSecurity = lazy(() => import("./pages/admin/core-engine/CoreSecurity"));
const CoreAds = lazy(() => import("./pages/admin/core-engine/CoreAds"));
const CorePush = lazy(() => import("./pages/admin/core-engine/CorePush"));
const CoreEditorial = lazy(() => import("./pages/admin/core-engine/CoreEditorial"));
const CoreRoles = lazy(() => import("./pages/admin/core-engine/CoreRoles"));
const CoreAutomation = lazy(() => import("./pages/admin/core-engine/CoreAutomation"));

// Geração Cotia (if exists)
const TrainingHub = lazy(() => import("./pages/admin/TrainingHub"));

// ─── QueryClient ────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

// ─── Suspense wrapper for lazy routes ───────────────────────────────────────
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

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
                        <BrowserRouter>
                          <MaintenanceGuard>
                            <Suspense fallback={<RouteFallback />}>
                              <Routes>
                                {/* Public Routes */}
                                <Route element={<PublicLayout />}>
                                  <Route path="/" element={<Index />} />
                                  <Route path="/noticia/:slug" element={<S><NewsDetail /></S>} />
                                  <Route path="/noticias" element={<S><NewsListPage /></S>} />
                                  <Route path="/busca" element={<S><SearchPage /></S>} />
                                  <Route path="/categoria/:slug" element={<S><CategoryPage /></S>} />
                                  <Route path="/comunidade" element={<S><CommunityHub /></S>} />
                                  <Route path="/comunidade/desbloquear" element={<S><CommunityUnlock /></S>} />
                                  <Route path="/comunidade/desafios" element={<S><ChallengesPage /></S>} />
                                  <Route path="/comunidade/como-ganhar-pontos" element={<S><HowToEarnPoints /></S>} />
                                  <Route path="/comunidade/membro/:userId" element={<S><MemberProfile /></S>} />
                                  <Route path="/comunidade/configuracoes" element={<S><ProfileSettings /></S>} />
                                  <Route path="/comunidade/gamificacao" element={<S><GamificationPage /></S>} />
                                  <Route path="/comunidade/guia" element={<S><CommunityMap /></S>} />
                                  <Route path="/comunidade/mapa" element={<Navigate to="/comunidade/guia" replace />} />
                                  <Route path="/comunidade/rede-do-bem" element={<S><RedeDoBem /></S>} />
                                  <Route path="/comunidade/grupos" element={<S><CommunityGroups /></S>} />
                                  <Route path="/comunidade/grupos/:slug" element={<S><CommunityGroups /></S>} />
                                  <Route path="/comunidade/beneficios" element={<S><CommunityBenefits /></S>} />
                                  <Route path="/comunidade/beneficios/celular-ideal" element={<S><PhoneChooserPage /></S>} />
                                  <Route path="/anti-fake-news" element={<S><AntiFakeNews /></S>} />
                                  <Route path="/voce-no-google" element={<S><VoceNoGoogle /></S>} />
                                  <Route path="/voce-no-google/cadastro" element={<S><BusinessCadastro /></S>} />
                                  <Route path="/campanha/google-maps" element={<Navigate to="/voce-no-google" replace />} />
                                  <Route path="/google-maps" element={<Navigate to="/voce-no-google" replace />} />
                                  <Route path="/web-radio-tv" element={<S><WebRadioTVCampaign /></S>} />
                                  <Route path="/campanha/radio-tv" element={<S><WebRadioTVCampaign /></S>} />
                                  <Route path="/transporte-escolar" element={<S><TransporteEscolarHome /></S>} />
                                  <Route path="/transporte-escolar/encontrar" element={<S><TransporteEscolarEncontrar /></S>} />
                                  <Route path="/transporte-escolar/cadastrar" element={<S><TransporteEscolarCadastrar /></S>} />
                                  <Route path="/transporte-escolar/escola/:slug" element={<S><TransporteEscolarEscola /></S>} />
                                  <Route path="/transporte-escolar/rede/:rede" element={<S><TransporteEscolarRede /></S>} />
                                  <Route path="/transporte-escolar/bairro/:bairro" element={<S><TransporteEscolarBairro /></S>} />
                                  <Route path="/censo-pcd" element={<S><CensoPcdHome /></S>} />
                                  <Route path="/censo-pcd/participar" element={<S><CensoPcdQuiz /></S>} />
                                  <Route path="/censo-pcd/concluido" element={<S><CensoPcdConclusao /></S>} />
                                  <Route path="/stories" element={<S><StoriesPage /></S>} />
                                  
                                  {/* Classifieds */}
                                  <Route path="/classificados" element={<S><ClassifiedsPage /></S>} />
                                  <Route path="/classificados/novo" element={<S><ClassifiedNewPage /></S>} />
                                  <Route path="/classificados/:id" element={<S><ClassifiedDetailPage /></S>} />
                                  
                                  {/* Jobs */}
                                  <Route path="/empregos" element={<S><JobsPage /></S>} />
                                  <Route path="/empregos/:id" element={<S><JobDetailPage /></S>} />
                                  <Route path="/comunidade/alertas-vagas" element={<S><JobAlertsPage /></S>} />
                                  
                                  {/* Real Estate */}
                                  <Route path="/imoveis" element={<S><ImoveisListPage /></S>} />
                                  <Route path="/imoveis/:slug" element={<S><ImovelDetailPage /></S>} />
                                  <Route path="/imoveis/corretor/:slug" element={<S><AnuncianteProfilePage /></S>} />
                                  <Route path="/imoveis/corretores" element={<S><CorretoresListPage /></S>} />
                                  <Route path="/imoveis/cidade/:cidade" element={<S><ImoveisCidadePage /></S>} />
                                  <Route path="/imoveis/cidade/:cidade/bairro/:bairro" element={<S><ImoveisBairroPage /></S>} />
                                  
                                  {/* Guia Comercial */}
                                  <Route path="/guia" element={<S><GuiaComercialPage /></S>} />
                                  <Route path="/guia/cadastrar" element={<S><GuiaCadastrarPage /></S>} />
                                  <Route path="/guia/planos" element={<S><GuiaPlanosPage /></S>} />
                                  <Route path="/guia/categoria/:slug" element={<S><GuiaCategoriaPage /></S>} />
                                  <Route path="/guia/cidade/:cidade" element={<S><GuiaCidadePage /></S>} />
                                  <Route path="/guia/:slug" element={<S><BusinessDetailPage /></S>} />
                                  <Route path="/guia/anunciante" element={<S><GuiaAnuncianteDashboard /></S>} />
                                  <Route path="/guia/anunciante/leads" element={<S><GuiaAnuncianteLeads /></S>} />
                                  <Route path="/guia/anunciante/editar/:id" element={<S><GuiaAnuncianteEditar /></S>} />
                                  
                                  {/* ENEM 2026 */}
                                  <Route path="/enem-2026" element={<S><Enem2026Landing /></S>} />
                                  
                                </Route>

                                {/* Fórmula Conexão — fora do PublicLayout para tela limpa */}
                                <Route path="/formula-conexao" element={<S><FormulaConexaoPage /></S>} />
                                <Route path="/regulamento-caminhao-premios" element={<S><RegulamentoCaminhaoPage /></S>} />

                                <Route path="/story/:slug" element={<S><StoryViewer /></S>} />
                                <Route path="/webstory/:campaignId" element={<S><WebStoryViewerPage /></S>} />
                                <Route path="/eventos" element={<S><EventosPublic /></S>} />
                                <Route path="/evento/:slug" element={<S><EventDetail /></S>} />
                                <Route path="/edicao/:slug" element={<S><EditionViewer /></S>} />
                                <Route path="/spah" element={<S><Auth /></S>} />
                                <Route path="/auth-comunidade" element={<S><CommunityAuth /></S>} />
                                <Route path="/reset-password" element={<S><ResetPassword /></S>} />
                                 
                                {/* Public Streaming */}
                                <Route path="/radio" element={<S><RouteModuleGuard module="web_radio"><RadioPage /></RouteModuleGuard></S>} />
                                <Route path="/tv" element={<S><RouteModuleGuard module="web_tv"><TvPage /></RouteModuleGuard></S>} />
                                
                                {/* Public Esportes */}
                                <Route path="/esportes/brasileirao" element={<S><BrasileiraoPage /></S>} />
                                <Route path="/esportes/brasileirao/noticia/:slug" element={<S><GeneratedNewsDetail /></S>} />
                                <Route path="/esportes/brasileirao/:serie" element={<S><SerieDetailPage /></S>} />
                                <Route path="/esportes/brasileirao/:serie/rodada/:round" element={<S><RoundPage /></S>} />
                                <Route path="/esportes/brasileirao/:serie/jogo/:slug" element={<S><MatchDetailPage /></S>} />
                                <Route path="/esportes/brasileirao/:serie/time/:slug" element={<S><TeamDetailPage /></S>} />
                                <Route path="/esportes/brasileirao/:serie/estatisticas/artilharia" element={<S><TopScorersPage /></S>} />
                                
                                {/* Studio Guest Entry */}
                                <Route path="/studio/join/:token" element={<S><ConexaoStudioGuestEntry /></S>} />

                                {/* ═══════ Admin Routes ═══════ */}
                                <Route path="/spah/painel" element={<AdminLayout />}>
                                  <Route index element={<S><Dashboard /></S>} />
                                  <Route path="noticias-ai" element={<S><NoticiasAI /></S>} />
                                  <Route path="relatorio-txt" element={<S><RelatorioTXT /></S>} />
                                  <Route path="news" element={<S><NewsList /></S>} />
                                  <Route path="news/import" element={<S><NewsImport /></S>} />
                                  <Route path="news/new" element={<S><NewsEditor /></S>} />
                                  <Route path="news/:id/edit" element={<S><NewsEditor /></S>} />
                                  <Route path="categories" element={<S><Categories /></S>} />
                                  <Route path="tags" element={<S><Tags /></S>} />
                                  <Route path="banners" element={<S><Banners /></S>} />
                                  <Route path="ads" element={<S><Ads /></S>} />
                                  <Route path="stories" element={<S><StoriesList /></S>} />
                                  <Route path="stories/new" element={<S><StoryEditor /></S>} />
                                  <Route path="stories/:id/edit" element={<S><StoryEditor /></S>} />
                                  <Route path="users" element={<S><Users /></S>} />
                                  <Route path="home-editor" element={<S><HomeEditor /></S>} />
                                  <Route path="quick-notes" element={<S><QuickNotesAdmin /></S>} />
                                  <Route path="analytics" element={<S><Analytics /></S>} />
                                  <Route path="reading-analytics" element={<S><ReadingAnalytics /></S>} />
                                  <Route path="noticias/:id" element={<S><NewsAnalytics /></S>} />
                                  <Route path="relatorio-semanal" element={<S><WeeklyReport /></S>} />
                                  <Route path="commercial-reports" element={<S><CommercialReports /></S>} />
                                  <Route path="analytics/leitura" element={<S><ReadingAnalytics /></S>} />
                                  <Route path="social" element={<S><SocialDashboard /></S>} />
                                  <Route path="social/queue" element={<S><SocialQueue /></S>} />
                                  <Route path="social/history" element={<S><SocialHistory /></S>} />
                                  <Route path="social/logs" element={<S><SocialLogs /></S>} />
                                  <Route path="social/settings" element={<S><SocialSettings /></S>} />
                                  
                                  {/* PostSocial */}
                                  <Route path="postsocial" element={<S><PostSocialDashboard /></S>} />
                                  <Route path="postsocial/new" element={<S><PostSocialComposer /></S>} />
                                  <Route path="postsocial/:id" element={<S><PostSocialComposer /></S>} />
                                  <Route path="postsocial/settings" element={<S><PostSocialSettings /></S>} />
                                  <Route path="postsocial/platforms" element={<S><PostSocialPlatformSetup /></S>} />
                                  
                                  <Route path="links" element={<S><LinksDashboard /></S>} />
                                  <Route path="links/create" element={<S><LinksBuilder /></S>} />
                                  <Route path="links/qr" element={<S><LinksQRGenerator /></S>} />
                                  <Route path="links/bio" element={<S><LinksBioBuilder /></S>} />
                                  <Route path="links/reports" element={<S><LinksReports /></S>} />
                                  <Route path="logs" element={<S><AuditLogs /></S>} />
                                  <Route path="sso-monitor" element={<S><SsoMonitor /></S>} />
                                  <Route path="settings" element={<S><Settings /></S>} />
                                  <Route path="settings/template" element={<S><TemplateSelector /></S>} />
                                  <Route path="settings/vocabulary" element={<S><VocabularyEditor /></S>} />
                                  <Route path="settings/modules" element={<S><ModulesManager /></S>} />
                                  <Route path="settings/menus" element={<S><MenuToggleSettings /></S>} />
                                  <Route path="settings/appearance" element={<S><AppearanceSettings /></S>} />
                                  <Route path="settings/logo" element={<S><BrandingLogoSettings /></S>} />
                                  <Route path="settings/ai-providers" element={<S><AIProviderSettings /></S>} />
                                  <Route path="solutions" element={<S><Solutions /></S>} />
                                  <Route path="notificacoes" element={<S><PushNotificationsAdmin /></S>} />
                                  <Route path="events" element={<S><EventsList /></S>} />
                                  <Route path="editions" element={<S><EditionsList /></S>} />
                                  <Route path="editions/new" element={<S><EditionEditor /></S>} />
                                  <Route path="editions/:id/edit" element={<S><EditionEditor /></S>} />
                                  <Route path="financial" element={<S><FinancialDashboard /></S>} />
                                  <Route path="financial/profiles" element={<S><FinancialProfiles /></S>} />
                                  <Route path="financial/receivables" element={<S><FinancialReceivables /></S>} />
                                  <Route path="financial/invoices" element={<S><FinancialInvoices /></S>} />
                                  
                                  {/* Redirects */}
                                  <Route path="training" element={<Navigate to="/spah/painel/academy" replace />} />
                                  <Route path="training/*" element={<Navigate to="/spah/painel/academy" replace />} />
                                  <Route path="universidade" element={<Navigate to="/spah/painel/academy" replace />} />
                                  <Route path="treinamento" element={<Navigate to="/spah/painel/academy" replace />} />
                                  
                                  <Route path="podcasts" element={<S><PodcastsList /></S>} />
                                  <Route path="anti-fake-news" element={<S><AntiFakeNewsAdmin /></S>} />
                                  
                                  {/* Auto Post PRO */}
                                  <Route path="autopost" element={<S><AutoPostDashboard /></S>} />
                                  <Route path="autopost/sources" element={<S><AutoPostSources /></S>} />
                                  <Route path="autopost/queue" element={<S><AutoPostQueue /></S>} />
                                  <Route path="autopost/groups" element={<S><AutoPostGroups /></S>} />
                                  <Route path="autopost/rules" element={<S><AutoPostRules /></S>} />
                                  <Route path="autopost/schedules" element={<S><AutoPostSchedules /></S>} />
                                  <Route path="autopost/media" element={<S><AutoPostMedia /></S>} />
                                  <Route path="autopost/duplicates" element={<S><AutoPostDuplicates /></S>} />
                                  <Route path="autopost/logs" element={<S><AutoPostLogs /></S>} />
                                  <Route path="autopost/reports" element={<S><AutoPostReports /></S>} />
                                  <Route path="autopost/settings" element={<S><AutoPostSettings /></S>} />
                                  <Route path="autopost/sources/new" element={<S><AutoPostSourceForm /></S>} />
                                  <Route path="autopost/sources/:id/edit" element={<S><AutoPostSourceForm /></S>} />
                                  
                                  {/* Auto Post Regional */}
                                  <Route path="autopost-regional" element={<S><RegionalDashboard /></S>} />
                                  <Route path="autopost-regional/fontes" element={<S><RegionalSources /></S>} />
                                  <Route path="autopost-regional/fontes/:id/edit" element={<S><RegionalSourceEdit /></S>} />
                                  <Route path="autopost-regional/fila" element={<S><RegionalQueue /></S>} />
                                  <Route path="autopost-regional/logs" element={<S><RegionalLogs /></S>} />
                                  
                                  {/* Content Fix */}
                                  <Route path="content-fix" element={<S><ContentFixDashboard /></S>} />
                                  <Route path="content-fix/images" element={<S><ImageFixer /></S>} />
                                  <Route path="content-fix/dates" element={<S><DateFixer /></S>} />
                                  <Route path="content-fix/validator" element={<S><ContentValidator /></S>} />
                                  <Route path="content-fix/content" element={<S><ContentFixer /></S>} />
                                  <Route path="content-fix/titles" element={<S><TitleFixer /></S>} />
                                  
                                  {/* Academy */}
                                  <Route path="academy" element={<S><AcademyDashboard /></S>} />
                                  <Route path="academy/curso/:slug" element={<S><AcademyCourse /></S>} />
                                  <Route path="academy/aula/:id" element={<S><AcademyLesson /></S>} />
                                  <Route path="academy/admin/categorias" element={<S><AcademyAdminCategories /></S>} />
                                  <Route path="academy/admin/cursos" element={<S><AcademyAdminCourses /></S>} />
                                  <Route path="academy/admin/cursos/:id/aulas" element={<S><AcademyAdminLessons /></S>} />
                                  
                                  {/* ENEM 2026 */}
                                  <Route path="academy/enem" element={<S><AcademyEnem /></S>} />
                                  <Route path="academy/enem/:slug" element={<S><EnemModule /></S>} />
                                  <Route path="academy/enem/:slug/semana/:weekNumber" element={<S><EnemWeek /></S>} />
                                  <Route path="academy/enem/:slug/semana/:weekNumber/aula/:lessonId" element={<S><EnemLessonPage /></S>} />
                                  <Route path="academy/enem/:slug/minhas-redacoes" element={<S><EnemSubmissions /></S>} />
                                  <Route path="academy/enem/:slug/redacao/:submissionId" element={<S><EnemSubmissionDetail /></S>} />
                                  
                                  {/* Esportes */}
                                  <Route path="esportes" element={<S><EsportesDashboard /></S>} />
                                  <Route path="esportes/brasileirao" element={<S><BrasileiraoHome /></S>} />
                                  <Route path="esportes/brasileirao/sync" element={<S><BrasileiraoSync /></S>} />
                                  <Route path="esportes/brasileirao/transmissoes" element={<S><BrasileiraoBroadcasts /></S>} />
                                  <Route path="esportes/brasileirao/noticias" element={<S><BrasileiraoNews /></S>} />
                                  <Route path="esportes/estatisticas" element={<S><EsportesEstatisticas /></S>} />
                                  <Route path="esportes/configurar" element={<S><EsportesConfig /></S>} />
                                  
                                  {/* Campaign Proofs */}
                                  <Route path="comprovantes" element={<S><CampaignProofsList /></S>} />
                                  <Route path="comprovantes/:id" element={<S><CampaignProofEditor /></S>} />
                                  
                                  {/* Publidoor */}
                                  <Route path="publidoor" element={<S><PublidoorDashboard /></S>} />
                                  <Route path="publidoor/criar" element={<S><PublidoorCreate /></S>} />
                                  <Route path="publidoor/:id/editar" element={<S><PublidoorEdit /></S>} />
                                  <Route path="publidoor/campanhas" element={<S><PublidoorCampaigns /></S>} />
                                  <Route path="publidoor/locais" element={<S><PublidoorLocations /></S>} />
                                  <Route path="publidoor/agenda" element={<S><PublidoorSchedules /></S>} />
                                  <Route path="publidoor/anunciantes" element={<S><PublidoorAdvertisers /></S>} />
                                  <Route path="publidoor/metricas" element={<S><PublidoorMetrics /></S>} />
                                  <Route path="publidoor/modelos" element={<S><PublidoorTemplates /></S>} />
                                  <Route path="publidoor/aprovacoes" element={<S><PublidoorApprovals /></S>} />
                                  <Route path="publidoor/config" element={<S><PublidoorSettings /></S>} />
                                  
                                  {/* Conexão.AI */}
                                  <Route path="conexao-ai" element={<S><ConexaoAIDashboard /></S>} />
                                  <Route path="conexao-ai/assistente" element={<S><ConexaoAIAssistant /></S>} />
                                  <Route path="conexao-ai/criador" element={<S><ConexaoAICreator /></S>} />
                                  <Route path="conexao-ai/ferramentas" element={<S><ConexaoAITools /></S>} />
                                  <Route path="conexao-ai/automacoes" element={<S><ConexaoAIAutomations /></S>} />
                                  <Route path="conexao-ai/insights" element={<S><ConexaoAIInsights /></S>} />
                                  
                                  {/* Partners */}
                                  <Route path="partners" element={<S><PartnersInbox /></S>} />
                                  <Route path="partners/manage" element={<S><PartnersManage /></S>} />
                                  <Route path="partners/sources" element={<S><PartnersSources /></S>} />
                                  <Route path="partners/pitches" element={<S><PartnersPitches /></S>} />
                                  
                                  {/* Community Admin */}
                                  <Route path="community" element={<S><CommunityAdmin /></S>} />
                                  <Route path="community/members" element={<S><CommunityMembers /></S>} />
                                  <Route path="community/moderation" element={<S><CommunityModeration /></S>} />
                                  <Route path="community/phone-catalog" element={<S><PhoneCatalogAdmin /></S>} />
                                  <Route path="community/phone-offers-report" element={<S><PhoneOffersReport /></S>} />
                                  <Route path="community/phone-import" element={<S><PhoneImportAssisted /></S>} />
                                  
                                  {/* Campaign Admin */}
                                  <Route path="campaigns" element={<S><CampaignsHub /></S>} />
                                  <Route path="campaigns/google-maps" element={<S><GoogleMapsLeads /></S>} />
                                  <Route path="campaigns/unified" element={<S><CampaignsUnified /></S>} />
                                  <Route path="campaigns/new" element={<S><CampaignEditor /></S>} />
                                  <Route path="campaigns/edit/:id" element={<S><CampaignEditor /></S>} />
                                  <Route path="campaigns/metrics/:id" element={<S><CampaignMetrics /></S>} />
                                  <Route path="campaigns/tutorial" element={<S><CampaignsTutorial /></S>} />
                                  <Route path="campaigns/media-kit" element={<S><MediaKit /></S>} />
                                  <Route path="diagnostico-anuncios" element={<S><AdDiagnostics /></S>} />
                                  <Route path="simulador-inventario" element={<S><AdInventorySimulator /></S>} />
                                  
                                  {/* Transporte Escolar Admin */}
                                  <Route path="transporte-escolar" element={<S><TransporteEscolarAdmin /></S>} />
                                  <Route path="transporte-escolar/escolas" element={<S><EscolasAdmin /></S>} />
                                  <Route path="transporte-escolar/transportadores" element={<S><TransportadoresAdmin /></S>} />
                                  <Route path="transporte-escolar/leads" element={<S><LeadsAdmin /></S>} />
                                  <Route path="transporte-escolar/reports" element={<S><ReportsAdmin /></S>} />
                                  
                                  {/* Censo PcD Admin */}
                                  <Route path="censo-pcd" element={<S><CensoPcdDashboard /></S>} />
                                  <Route path="censo-pcd/respostas" element={<S><CensoPcdRespostas /></S>} />
                                  
                                  {/* Imóveis Admin */}
                                  <Route path="imoveis" element={<S><ImoveisAdmin /></S>} />
                                  <Route path="imoveis/novo" element={<S><ImovelEditor /></S>} />
                                  <Route path="imoveis/:id/editar" element={<S><ImovelEditor /></S>} />
                                  
                                  {/* Conexão Stream Hub */}
                                  <Route path="stream" element={<S><ConexaoStream /></S>} />
                                  
                                  {/* Broadcast Admin */}
                                  <Route path="broadcast" element={<S><BroadcastDashboard /></S>} />
                                  <Route path="broadcast/list" element={<S><BroadcastList /></S>} />
                                  <Route path="broadcast/new" element={<S><BroadcastForm /></S>} />
                                  <Route path="broadcast/:id/edit" element={<S><BroadcastForm /></S>} />
                                  <Route path="broadcast/channels" element={<S><BroadcastChannels /></S>} />
                                  <Route path="broadcast/programs" element={<S><BroadcastPrograms /></S>} />
                                  <Route path="broadcast/playlist" element={<S><BroadcastPlaylist /></S>} />
                                  <Route path="broadcast/videos" element={<S><BroadcastVideoPlaylist /></S>} />
                                  <Route path="broadcast/studio/:id" element={<S><BroadcastStudio /></S>} />
                                  
                                  {/* Conexão Studio Admin */}
                                  <Route path="conexao-studio" element={<S><ConexaoStudioDashboard /></S>} />
                                  <Route path="conexao-studio/studios" element={<S><ConexaoStudioList /></S>} />
                                  <Route path="conexao-studio/studios/new" element={<S><ConexaoStudioCreate /></S>} />
                                  <Route path="conexao-studio/studios/:slug/session" element={<S><ConexaoStudioSession /></S>} />
                                  <Route path="conexao-studio/library" element={<S><ConexaoStudioLibrary /></S>} />
                                  <Route path="conexao-studio/destinations" element={<S><ConexaoStudioDestinations /></S>} />
                                  <Route path="conexao-studio/webinars" element={<S><ConexaoStudioWebinars /></S>} />
                                  <Route path="conexao-studio/branding" element={<S><ConexaoStudioBranding /></S>} />
                                  <Route path="conexao-studio/team" element={<S><ConexaoStudioTeam /></S>} />
                                  
                                  {/* Radio Admin */}
                                  <Route path="radio" element={<S><RadioOverview /></S>} />
                                  <Route path="radio/status" element={<S><RadioStatus /></S>} />
                                  <Route path="radio/encoder" element={<S><RadioEncoder /></S>} />
                                  <Route path="radio/autodj" element={<S><RadioAutoDJ /></S>} />
                                  <Route path="radio/library" element={<S><RadioLibrary /></S>} />
                                  <Route path="radio/stats" element={<S><RadioStats /></S>} />
                                  <Route path="radio/players" element={<S><RadioPlayers /></S>} />
                                  <Route path="radio/settings" element={<S><RadioSettings /></S>} />
                                  
                                  {/* TV Admin */}
                                  <Route path="tv" element={<S><TvOverview /></S>} />
                                  <Route path="tv/live" element={<S><TvLive /></S>} />
                                  <Route path="tv/schedule" element={<S><TvSchedule /></S>} />
                                  <Route path="tv/vod" element={<S><TvVod /></S>} />
                                  <Route path="tv/uploads" element={<S><TvUploads /></S>} />
                                  <Route path="tv/stats" element={<S><TvStats /></S>} />
                                  <Route path="tv/players" element={<S><TvPlayers /></S>} />
                                  <Route path="tv/settings" element={<S><TvSettings /></S>} />
                                  
                                  {/* Streaming Config */}
                                  <Route path="streaming/radio" element={<S><StreamingRadioConfig /></S>} />
                                  <Route path="streaming/tv" element={<S><StreamingTvConfig /></S>} />
                                  
                                  {/* Core Engine */}
                                  <Route path="core-engine" element={<S><CoreEngineDashboard /></S>} />
                                  <Route path="core-engine/redirect" element={<S><CoreRedirects /></S>} />
                                  <Route path="core-engine/analytics" element={<S><CoreAnalytics /></S>} />
                                  <Route path="core-engine/seo" element={<S><CoreSEO /></S>} />
                                  <Route path="core-engine/media" element={<S><CoreMedia /></S>} />
                                  <Route path="core-engine/performance" element={<S><CorePerformance /></S>} />
                                  <Route path="core-engine/leads" element={<S><CoreLeads /></S>} />
                                  <Route path="core-engine/schema" element={<S><CoreSchema /></S>} />
                                  <Route path="core-engine/security" element={<S><CoreSecurity /></S>} />
                                  <Route path="core-engine/ads" element={<S><CoreAds /></S>} />
                                  <Route path="core-engine/push" element={<S><CorePush /></S>} />
                                  <Route path="core-engine/editorial" element={<S><CoreEditorial /></S>} />
                                  <Route path="core-engine/roles" element={<S><CoreRoles /></S>} />
                                  <Route path="core-engine/automation" element={<S><CoreAutomation /></S>} />
                                  <Route path="core-engine/:moduleId" element={<S><CoreModulePage /></S>} />

                                  {/* Tenant Management (Superadmin) */}
                                  <Route path="tenants" element={<S><TenantManagement /></S>} />

                                  {/* Classifieds & Jobs Admin */}
                                  <Route path="classifieds" element={<S><ClassifiedsAdmin /></S>} />
                                  <Route path="jobs" element={<S><JobsAdmin /></S>} />
                                </Route>
                                
                                {/* Broadcast Public */}
                                <Route path="/ao-vivo" element={<S><RouteModuleGuard module="lives"><BroadcastHub /></RouteModuleGuard></S>} />
                                <Route path="/ao-vivo/acesso" element={<S><RouteModuleGuard module="lives"><WebRadioTVAccess /></RouteModuleGuard></S>} />
                                <Route path="/ao-vivo/studio" element={<S><RouteModuleGuard module="lives"><LiveStudioPromo /></RouteModuleGuard></S>} />
                                <Route path="/ao-vivo/programacao" element={<S><RouteModuleGuard module="schedule"><BroadcastSchedule /></RouteModuleGuard></S>} />
                                <Route path="/ao-vivo/arquivo" element={<S><RouteModuleGuard module="vod"><BroadcastArchive /></RouteModuleGuard></S>} />
                                <Route path="/ao-vivo/:slug" element={<S><RouteModuleGuard module="lives"><BroadcastWatch /></RouteModuleGuard></S>} />
                                <Route path="/join/:inviteToken" element={<S><GuestJoin /></S>} />

                                {/* Publidoor Partner */}
                                <Route path="/partner/login" element={<S><PartnerLogin /></S>} />
                                <Route path="/partner" element={<S><PartnerLayout /></S>}>
                                  <Route index element={<Navigate to="/partner/publidoor" replace />} />
                                  <Route path="publidoor" element={<S><PartnerVitrine /></S>} />
                                  <Route path="publidoor/editar" element={<S><PartnerEditor /></S>} />
                                  <Route path="publidoor/editar/:id" element={<S><PartnerEditor /></S>} />
                                  <Route path="publidoor/agenda" element={<S><PartnerAgenda /></S>} />
                                  <Route path="publidoor/metricas" element={<S><PartnerMetricsPage /></S>} />
                                  <Route path="publidoor/negocio" element={<S><PartnerBusiness /></S>} />
                                  <Route path="publidoor/plano" element={<S><PartnerPlan /></S>} />
                                </Route>

                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Suspense>
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

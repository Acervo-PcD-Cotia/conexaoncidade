import { ROUTES } from '@/config/routes';

const CAMPAIGNS_BASE = `${ROUTES.ADMIN}/campaigns`;

export const campaignRoutes = {
  hub: () => CAMPAIGNS_BASE,
  unified: () => `${CAMPAIGNS_BASE}/unified`,
  new: () => `${CAMPAIGNS_BASE}/new`,
  edit: (id: string) => `${CAMPAIGNS_BASE}/edit/${id}`,
  metrics: (id: string) => `${CAMPAIGNS_BASE}/metrics/${id}`,
  googleMaps: () => `${CAMPAIGNS_BASE}/google-maps`,
  tutorial: () => `${CAMPAIGNS_BASE}/tutorial`,
} as const;

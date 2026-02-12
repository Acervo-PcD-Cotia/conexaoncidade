import { useReducer, useCallback } from 'react';
import type {
  CampaignStatus,
  ChannelType,
  AdsChannelConfig,
  PublidoorChannelConfig,
  WebStoriesChannelConfig,
  PushChannelConfig,
  NewsletterChannelConfig,
  ExitIntentChannelConfig,
  LoginPanelChannelConfig,
  CampaignFormData,
} from '@/types/campaigns-unified';

// ============================================
// STATE
// ============================================

export interface ChannelConfigs {
  ads: Partial<AdsChannelConfig>;
  publidoor: Partial<PublidoorChannelConfig>;
  webstories: Partial<WebStoriesChannelConfig>;
  push: Partial<PushChannelConfig>;
  newsletter: Partial<NewsletterChannelConfig>;
  exit_intent: Partial<ExitIntentChannelConfig>;
  login_panel: Partial<LoginPanelChannelConfig>;
}

export interface ChannelAssets {
  ads: { url: string; alt: string };
  publidoor: { url: string; alt: string };
  webstories: { url: string; alt: string };
  exitIntentHero: { url: string };
  exitIntentSecondary1: { url: string };
  exitIntentSecondary2: { url: string };
  loginPanel: { url: string };
}

export interface CampaignFormState {
  status: CampaignStatus;
  selectedChannels: ChannelType[];
  channelConfigs: ChannelConfigs;
  assets: ChannelAssets;
  validationErrors: string[];
}

// ============================================
// ACTIONS
// ============================================

export type CampaignFormAction =
  | { type: 'SET_STATUS'; payload: CampaignStatus }
  | { type: 'TOGGLE_CHANNEL'; payload: ChannelType }
  | { type: 'SET_CHANNEL_CONFIG'; payload: { channel: ChannelType; config: Partial<Record<string, unknown>> } }
  | { type: 'SET_ASSET'; payload: { key: keyof ChannelAssets; url: string; alt?: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: string[] };

// ============================================
// DEFAULTS
// ============================================

const DEFAULT_CONFIGS: ChannelConfigs = {
  ads: { slot_type: 'home_top', size: '970x250', sort_order: 0, link_target: '_blank' },
  publidoor: { type: 'narrativo', phrase_1: '' },
  webstories: { story_type: 'external' },
  push: { title: '', body: '', action_url: '', target_audience: 'all' },
  newsletter: { subject: '', preview_text: '', target_list: '' },
  exit_intent: { hero_type: 'publidoor', cta_text: 'Continuar navegando', priority_type: 'commercial' },
  login_panel: { display_type: 'publidoor' },
};

const DEFAULT_ASSETS: ChannelAssets = {
  ads: { url: '', alt: '' },
  publidoor: { url: '', alt: '' },
  webstories: { url: '', alt: '' },
  exitIntentHero: { url: '' },
  exitIntentSecondary1: { url: '' },
  exitIntentSecondary2: { url: '' },
  loginPanel: { url: '' },
};

// ============================================
// INITIAL STATE FACTORY
// ============================================

export function createInitialState(initialData?: Partial<CampaignFormData>): CampaignFormState {
  return {
    status: initialData?.status || 'draft',
    selectedChannels: initialData?.enabledChannels || [],
    channelConfigs: {
      ads: initialData?.adsConfig || DEFAULT_CONFIGS.ads,
      publidoor: initialData?.publidoorConfig || DEFAULT_CONFIGS.publidoor,
      webstories: initialData?.webstoriesConfig || DEFAULT_CONFIGS.webstories,
      push: initialData?.pushConfig || DEFAULT_CONFIGS.push,
      newsletter: initialData?.newsletterConfig || DEFAULT_CONFIGS.newsletter,
      exit_intent: initialData?.exitIntentConfig || DEFAULT_CONFIGS.exit_intent,
      login_panel: initialData?.loginPanelConfig || DEFAULT_CONFIGS.login_panel,
    },
    assets: DEFAULT_ASSETS,
    validationErrors: [],
  };
}

// ============================================
// REDUCER
// ============================================

export function campaignFormReducer(
  state: CampaignFormState,
  action: CampaignFormAction
): CampaignFormState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };

    case 'TOGGLE_CHANNEL': {
      const channel = action.payload;
      const isSelected = state.selectedChannels.includes(channel);
      return {
        ...state,
        selectedChannels: isSelected
          ? state.selectedChannels.filter(c => c !== channel)
          : [...state.selectedChannels, channel],
      };
    }

    case 'SET_CHANNEL_CONFIG': {
      const { channel, config } = action.payload;
      return {
        ...state,
        channelConfigs: {
          ...state.channelConfigs,
          [channel]: config,
        },
      };
    }

    case 'SET_ASSET': {
      const { key, url, alt } = action.payload;
      const currentAsset = state.assets[key];
      const updatedAsset = 'alt' in currentAsset
        ? { url, alt: alt ?? (currentAsset as { url: string; alt: string }).alt }
        : { url };
      return {
        ...state,
        assets: {
          ...state.assets,
          [key]: updatedAsset,
        },
      };
    }

    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };

    default:
      return state;
  }
}

// ============================================
// HOOK
// ============================================

export function useCampaignFormReducer(initialData?: Partial<CampaignFormData>) {
  const [state, dispatch] = useReducer(
    campaignFormReducer,
    initialData,
    createInitialState
  );

  const setStatus = useCallback((status: CampaignStatus) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  }, []);

  const toggleChannel = useCallback((channel: ChannelType) => {
    dispatch({ type: 'TOGGLE_CHANNEL', payload: channel });
  }, []);

  const setChannelConfig = useCallback((channel: ChannelType, config: Partial<Record<string, unknown>>) => {
    dispatch({ type: 'SET_CHANNEL_CONFIG', payload: { channel, config } });
  }, []);

  const setAsset = useCallback((key: keyof ChannelAssets, url: string, alt?: string) => {
    dispatch({ type: 'SET_ASSET', payload: { key, url, alt } });
  }, []);

  const setValidationErrors = useCallback((errors: string[]) => {
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
  }, []);

  return {
    state,
    dispatch,
    setStatus,
    toggleChannel,
    setChannelConfig,
    setAsset,
    setValidationErrors,
  };
}

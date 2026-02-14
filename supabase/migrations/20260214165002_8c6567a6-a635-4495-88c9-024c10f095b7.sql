-- Add new channel types to the enum
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'banner_intro';
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'floating_ad';

-- Add new asset types to the enum
ALTER TYPE campaign_asset_type ADD VALUE IF NOT EXISTS 'banner_intro';
ALTER TYPE campaign_asset_type ADD VALUE IF NOT EXISTS 'floating_ad';
ALTER TYPE campaign_asset_type ADD VALUE IF NOT EXISTS 'exit_full';
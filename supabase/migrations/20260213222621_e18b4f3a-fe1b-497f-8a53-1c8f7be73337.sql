-- Increase file_size_limit for ads bucket from 2MB to 30MB
UPDATE storage.buckets 
SET file_size_limit = 31457280 
WHERE id = 'ads';

-- Increase file_size_limit for campaign-assets bucket from 2MB to 30MB
UPDATE storage.buckets 
SET file_size_limit = 31457280 
WHERE id = 'campaign-assets';
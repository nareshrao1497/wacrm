-- ============================================================
-- 041_ad_attribution.sql — WhatsApp Ads Attribution
--
-- Adds columns to track inbound leads from Meta Click-to-WhatsApp ads.
--
-- contacts:
--   - source (text): e.g. 'ad', 'organic'
--   - ad_id (text): Meta Ad ID
--   - ad_title (text): Meta Ad Title
--
-- conversations:
--   - referral_data (jsonb): Raw referral object from WhatsApp webhook
-- ============================================================

ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS ad_id text,
ADD COLUMN IF NOT EXISTS ad_title text;

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS referral_data jsonb;

-- Create an index to easily query contacts by ad_id for analytics later
CREATE INDEX IF NOT EXISTS idx_contacts_ad_id ON contacts(ad_id) WHERE ad_id IS NOT NULL;

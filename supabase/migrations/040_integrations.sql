-- ============================================================
-- 040_integrations.sql — Native Integrations framework
--
-- Adds the `integrations` table to store credentials and settings
-- for native third-party integrations (Shopify, WooCommerce, Google Sheets).
--
-- Design notes
--   - Account-scoped.
--   - Credentials (API keys, OAuth tokens) are stored in a JSONB
--     column. Sensitive fields should be encrypted at the application
--     layer before writing.
--   - Settings JSONB column holds user preferences (e.g. which events
--     to sync, which spreadsheet ID to use).
--
-- RLS
--   Settings-class table: any member may *read* their account's integrations,
--   only admin+ may create/update/delete.
-- ============================================================

CREATE TABLE IF NOT EXISTS integrations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider     text NOT NULL,             -- 'shopify', 'woocommerce', 'google_sheets'
  credentials  jsonb NOT NULL DEFAULT '{}'::jsonb, -- encrypted tokens/keys
  settings     jsonb NOT NULL DEFAULT '{}'::jsonb, -- configuration (events, template names, etc)
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  
  -- Prevent multiple active integrations of the same provider per account
  -- (if desired, remove this constraint to allow multiple stores)
  UNIQUE(account_id, provider)
);

CREATE INDEX IF NOT EXISTS integrations_account_id_idx ON integrations (account_id);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS integrations_select ON integrations;
CREATE POLICY integrations_select ON integrations FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS integrations_insert ON integrations;
CREATE POLICY integrations_insert ON integrations FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS integrations_update ON integrations;
CREATE POLICY integrations_update ON integrations FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS integrations_delete ON integrations;
CREATE POLICY integrations_delete ON integrations FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS integrations_updated_at_trigger ON integrations;
CREATE TRIGGER integrations_updated_at_trigger
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- ENUMS
-- =========================
CREATE TYPE ledger_group AS ENUM (
  'sundry-debtors',
  'sundry-creditors',
  'bank-accounts',
  'cash-in-hand',
  'sales-accounts',
  'purchase-accounts',
  'direct-expenses',
  'indirect-expenses',
  'direct-incomes',
  'indirect-incomes',
  'fixed-assets',
  'current-assets',
  'current-liabilities',
  'capital-account'
);

CREATE TYPE voucher_type AS ENUM (
  'sales',
  'purchase',
  'payment',
  'receipt',
  'journal',
  'contra',
  'credit-note',
  'debit-note'
);

CREATE TYPE dr_cr AS ENUM ('debit', 'credit');

-- =========================
-- COMPANIES
-- =========================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  gstin VARCHAR(15) NOT NULL,
  pan VARCHAR(10) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  financial_year_start DATE NOT NULL,
  financial_year_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- LEDGERS
-- =========================
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  group ledger_group NOT NULL,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  address TEXT,
  phone VARCHAR(20),
  gstin VARCHAR(15),
  email VARCHAR(255),
  is_billwise BOOLEAN DEFAULT false,
  is_inventory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_opening_balance CHECK (
    (group IN ('sundry-creditors','capital-account','current-liabilities') AND opening_balance <= 0)
    OR
    (group NOT IN ('sundry-creditors','capital-account','current-liabilities'))
  )
);

-- =========================
-- VOUCHERS
-- =========================
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  voucher_number VARCHAR(50) NOT NULL,
  type voucher_type NOT NULL,
  date DATE NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id),
  narration TEXT,
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- VOUCHER ITEMS
-- =========================
CREATE TABLE voucher_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_id UUID REFERENCES ledgers(id),
  amount DECIMAL(15,2) NOT NULL,
  type dr_cr NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- STOCK ITEMS
-- =========================
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity INTEGER DEFAULT 0,
  rate DECIMAL(15,2) DEFAULT 0,
  value DECIMAL(15,2) DEFAULT 0,
  group_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_ledgers_company ON ledgers(company_id);
CREATE INDEX idx_vouchers_company ON vouchers(company_id);
CREATE INDEX idx_voucher_items_company ON voucher_items(company_id);

-- =========================
-- TRIGGERS
-- =========================

-- Ledger Balance Update
CREATE OR REPLACE FUNCTION update_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_ledger UUID;
  d DECIMAL;
  c DECIMAL;
BEGIN
  v_ledger := COALESCE(NEW.ledger_id, OLD.ledger_id);

  SELECT COALESCE(SUM(amount),0) INTO d
  FROM voucher_items WHERE ledger_id = v_ledger AND type='debit';

  SELECT COALESCE(SUM(amount),0) INTO c
  FROM voucher_items WHERE ledger_id = v_ledger AND type='credit';

  UPDATE ledgers
  SET current_balance = opening_balance + d - c,
      updated_at = NOW()
  WHERE id = v_ledger;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_balance
AFTER INSERT OR UPDATE OR DELETE ON voucher_items
FOR EACH ROW EXECUTE FUNCTION update_ledger_balance();

-- Voucher Total Update
CREATE OR REPLACE FUNCTION update_voucher_total()
RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  v_id := COALESCE(NEW.voucher_id, OLD.voucher_id);

  UPDATE vouchers
  SET total_amount = (
    SELECT COALESCE(SUM(amount),0)
    FROM voucher_items WHERE voucher_id = v_id
  ),
  updated_at = NOW()
  WHERE id = v_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_voucher_total
AFTER INSERT OR UPDATE OR DELETE ON voucher_items
FOR EACH ROW EXECUTE FUNCTION update_voucher_total();

-- Double Entry Enforcement
CREATE OR REPLACE FUNCTION enforce_double_entry()
RETURNS TRIGGER AS $$
DECLARE
  d DECIMAL;
  c DECIMAL;
  v_id UUID;
BEGIN
  v_id := COALESCE(NEW.voucher_id, OLD.voucher_id);

  SELECT
    SUM(CASE WHEN type='debit' THEN amount ELSE 0 END),
    SUM(CASE WHEN type='credit' THEN amount ELSE 0 END)
  INTO d, c
  FROM voucher_items WHERE voucher_id = v_id;

  IF d IS NOT NULL AND c IS NOT NULL AND d <> c THEN
    RAISE EXCEPTION 'Voucher % not balanced. Debit=% Credit=%', v_id, d, c;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_double_entry
AFTER INSERT OR UPDATE OR DELETE ON voucher_items
FOR EACH ROW EXECUTE FUNCTION enforce_double_entry();

-- Stock Value Update
CREATE OR REPLACE FUNCTION update_stock_value()
RETURNS TRIGGER AS $$
BEGIN
  NEW.value := NEW.quantity * NEW.rate;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_value
BEFORE INSERT OR UPDATE ON stock_items
FOR EACH ROW EXECUTE FUNCTION update_stock_value();

-- =========================
-- ROW LEVEL SECURITY
-- =========================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_isolation
ON companies
FOR ALL USING (true);

CREATE POLICY ledger_isolation
ON ledgers
FOR ALL USING (true);

CREATE POLICY voucher_isolation
ON vouchers
FOR ALL USING (true);

CREATE POLICY voucher_items_isolation
ON voucher_items
FOR ALL USING (true);

CREATE POLICY stock_isolation
ON stock_items
FOR ALL USING (true);
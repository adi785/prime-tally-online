-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ledger groups table
CREATE TABLE ledger_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ledger groups
INSERT INTO ledger_groups (name) VALUES
  ('sundry-debtors'),
  ('sundry-creditors'),
  ('bank-accounts'),
  ('cash-in-hand'),
  ('sales-accounts'),
  ('purchase-accounts'),
  ('direct-expenses'),
  ('indirect-expenses'),
  ('direct-incomes'),
  ('indirect-incomes'),
  ('fixed-assets'),
  ('current-assets'),
  ('current-liabilities'),
  ('capital-account')
ON CONFLICT (name) DO NOTHING;

-- Create ledgers table
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  group_id UUID REFERENCES ledger_groups(id) ON DELETE CASCADE,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  address TEXT,
  phone VARCHAR(20),
  gstin VARCHAR(15),
  email VARCHAR(255),
  is_billwise BOOLEAN DEFAULT false,
  is_inventory BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create voucher types table
CREATE TABLE voucher_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default voucher types
INSERT INTO voucher_types (name) VALUES
  ('sales'),
  ('purchase'),
  ('payment'),
  ('receipt'),
  ('journal'),
  ('contra'),
  ('credit-note'),
  ('debit-note')
ON CONFLICT (name) DO NOTHING;

-- Create vouchers table
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_number VARCHAR(50) NOT NULL,
  type_id UUID REFERENCES voucher_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
  narration TEXT,
  total_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create voucher items table
CREATE TABLE voucher_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('debit', 'credit')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock items table
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) DEFAULT 0,
  rate DECIMAL(15,2) DEFAULT 0,
  value DECIMAL(15,2) DEFAULT 0,
  group_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create company table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  gstin VARCHAR(15) NOT NULL,
  pan VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  financial_year_start DATE NOT NULL,
  financial_year_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_ledgers_group_id ON ledgers(group_id);
CREATE INDEX idx_ledgers_created_by ON ledgers(created_by);
CREATE INDEX idx_vouchers_type_id ON vouchers(type_id);
CREATE INDEX idx_vouchers_party_ledger_id ON vouchers(party_ledger_id);
CREATE INDEX idx_vouchers_created_by ON vouchers(created_by);
CREATE INDEX idx_voucher_items_voucher_id ON voucher_items(voucher_id);
CREATE INDEX idx_voucher_items_ledger_id ON voucher_items(ledger_id);
CREATE INDEX idx_stock_items_created_by ON stock_items(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE ledger_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ledgers
CREATE POLICY "ledgers_select_policy" ON ledgers 
FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "ledgers_insert_policy" ON ledgers 
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "ledgers_update_policy" ON ledgers 
FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "ledgers_delete_policy" ON ledgers 
FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Create RLS policies for vouchers
CREATE POLICY "vouchers_select_policy" ON vouchers 
FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "vouchers_insert_policy" ON vouchers 
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "vouchers_update_policy" ON vouchers 
FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "vouchers_delete_policy" ON vouchers 
FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Create RLS policies for voucher_items
CREATE POLICY "voucher_items_select_policy" ON voucher_items 
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM vouchers WHERE vouchers.id = voucher_items.voucher_id AND vouchers.created_by = auth.uid())
);

CREATE POLICY "voucher_items_insert_policy" ON voucher_items 
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM vouchers WHERE vouchers.id = voucher_items.voucher_id AND vouchers.created_by = auth.uid())
);

CREATE POLICY "voucher_items_update_policy" ON voucher_items 
FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM vouchers WHERE vouchers.id = voucher_items.voucher_id AND vouchers.created_by = auth.uid())
);

CREATE POLICY "voucher_items_delete_policy" ON voucher_items 
FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM vouchers WHERE vouchers.id = voucher_items.voucher_id AND vouchers.created_by = auth.uid())
);

-- Create RLS policies for stock_items
CREATE POLICY "stock_items_select_policy" ON stock_items 
FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "stock_items_insert_policy" ON stock_items 
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "stock_items_update_policy" ON stock_items 
FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "stock_items_delete_policy" ON stock_items 
FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Create RLS policies for companies
CREATE POLICY "companies_select_policy" ON companies 
FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "companies_insert_policy" ON companies 
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "companies_update_policy" ON companies 
FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "companies_delete_policy" ON companies 
FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Create function to update current_balance in ledgers
CREATE OR REPLACE FUNCTION update_ledger_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current balance for the affected ledger
  UPDATE ledgers 
  SET current_balance = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN vi.type = 'debit' THEN vi.amount 
        ELSE -vi.amount 
      END
    ), 0) + opening_balance
    FROM voucher_items vi
    JOIN vouchers v ON vi.voucher_id = v.id
    WHERE vi.ledger_id = NEW.ledger_id
  )
  WHERE id = NEW.ledger_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voucher_items
CREATE TRIGGER update_ledger_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON voucher_items
  FOR EACH ROW EXECUTE FUNCTION update_ledger_balance();

-- Create function to auto-generate voucher numbers
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voucher_number IS NULL OR NEW.voucher_number = '' THEN
    NEW.voucher_number := CONCAT(
      UPPER(LEFT((SELECT name FROM voucher_types WHERE id = NEW.type_id), 2)),
      '-',
      LPAD(COALESCE(
        (SELECT COUNT(*) + 1 FROM vouchers v2 
         WHERE v2.type_id = NEW.type_id 
         AND EXTRACT(YEAR FROM v2.date) = EXTRACT(YEAR FROM NEW.date)), 1
      )::TEXT, 4, '0'),
      '/',
      EXTRACT(YEAR FROM NEW.date)::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vouchers
CREATE TRIGGER generate_voucher_number_trigger
  BEFORE INSERT ON vouchers
  FOR EACH ROW EXECUTE FUNCTION generate_voucher_number();
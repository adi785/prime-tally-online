-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ledger groups table
CREATE TABLE ledger_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  name VARCHAR(200) NOT NULL,
  group_id UUID REFERENCES ledger_groups(id) ON DELETE CASCADE,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  address TEXT,
  phone VARCHAR(20),
  gstin VARCHAR(15),
  email VARCHAR(100),
  is_billwise BOOLEAN DEFAULT false,
  is_inventory BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voucher types table
CREATE TABLE voucher_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default voucher types
INSERT INTO voucher_types (name) VALUES
  ('sales'),
  ('purchase'),
  ('receipt'),
  ('payment'),
  ('journal'),
  ('contra'),
  ('credit-note'),
  ('debit-note')
ON CONFLICT (name) DO NOTHING;

-- Create vouchers table
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_number VARCHAR(50) UNIQUE,
  type_id UUID REFERENCES voucher_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
  narration TEXT,
  total_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  name VARCHAR(200) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(15,2) DEFAULT 0,
  rate DECIMAL(15,2) DEFAULT 0,
  value DECIMAL(15,2) DEFAULT 0,
  group_name VARCHAR(100) DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company info table
CREATE TABLE company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  gstin VARCHAR(15) NOT NULL,
  pan VARCHAR(10) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  financial_year_start DATE NOT NULL,
  financial_year_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ledgers_group_id ON ledgers(group_id);
CREATE INDEX idx_vouchers_type_id ON vouchers(type_id);
CREATE INDEX idx_vouchers_party_ledger_id ON vouchers(party_ledger_id);
CREATE INDEX idx_vouchers_date ON vouchers(date);
CREATE INDEX idx_voucher_items_voucher_id ON voucher_items(voucher_id);
CREATE INDEX idx_voucher_items_ledger_id ON voucher_items(ledger_id);

-- Create function to update ledger balances
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

-- Create trigger to update ledger balances
DROP TRIGGER IF EXISTS trigger_update_ledger_balance ON voucher_items;
CREATE TRIGGER trigger_update_ledger_balance
  AFTER INSERT OR UPDATE OR DELETE ON voucher_items
  FOR EACH ROW EXECUTE FUNCTION update_ledger_balance();

-- Create function to generate voucher numbers
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voucher_number IS NULL THEN
    NEW.voucher_number := UPPER(LEFT(NEW.type_id::text, 3)) || '-' || 
                         LPAD((SELECT COUNT(*) + 1 FROM vouchers WHERE type_id = NEW.type_id)::text, 4, '0') || 
                         '-' || EXTRACT(YEAR FROM NEW.date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate voucher numbers
DROP TRIGGER IF EXISTS trigger_generate_voucher_number ON vouchers;
CREATE TRIGGER trigger_generate_voucher_number
  BEFORE INSERT ON vouchers
  FOR EACH ROW EXECUTE FUNCTION generate_voucher_number();

-- Enable Row Level Security (RLS)
ALTER TABLE ledger_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Create policies for ledger_groups (public read)
CREATE POLICY "Allow public read access to ledger groups" ON ledger_groups
FOR SELECT USING (true);

-- Create policies for ledgers (authenticated users only)
CREATE POLICY "Allow authenticated users to read ledgers" ON ledgers
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert ledgers" ON ledgers
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ledgers" ON ledgers
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete ledgers" ON ledgers
FOR DELETE TO authenticated USING (true);

-- Create policies for voucher_types (public read)
CREATE POLICY "Allow public read access to voucher types" ON voucher_types
FOR SELECT USING (true);

-- Create policies for vouchers (authenticated users only)
CREATE POLICY "Allow authenticated users to read vouchers" ON vouchers
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert vouchers" ON vouchers
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update vouchers" ON vouchers
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete vouchers" ON vouchers
FOR DELETE TO authenticated USING (true);

-- Create policies for voucher_items (authenticated users only)
CREATE POLICY "Allow authenticated users to read voucher items" ON voucher_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert voucher items" ON voucher_items
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update voucher items" ON voucher_items
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete voucher items" ON voucher_items
FOR DELETE TO authenticated USING (true);

-- Create policies for stock_items (authenticated users only)
CREATE POLICY "Allow authenticated users to read stock items" ON stock_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert stock items" ON stock_items
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update stock items" ON stock_items
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete stock items" ON stock_items
FOR DELETE TO authenticated USING (true);

-- Create policies for company_info (authenticated users only)
CREATE POLICY "Allow authenticated users to read company info" ON company_info
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert company info" ON company_info
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update company info" ON company_info
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete company info" ON company_info
FOR DELETE TO authenticated USING (true);
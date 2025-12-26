-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ledger groups enum
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

-- Create voucher types enum
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

-- Create ledgers table
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vouchers table
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_number VARCHAR(50) NOT NULL,
  type voucher_type NOT NULL,
  date DATE NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
  narration TEXT,
  total_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voucher_items table
CREATE TABLE voucher_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('debit', 'credit')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_items table
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  rate DECIMAL(15,2) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  group_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ledgers_group ON ledgers(group);
CREATE INDEX idx_ledgers_name ON ledgers(name);
CREATE INDEX idx_vouchers_date ON vouchers(date);
CREATE INDEX idx_vouchers_type ON vouchers(type);
CREATE INDEX idx_vouchers_party_ledger_id ON vouchers(party_ledger_id);
CREATE INDEX idx_voucher_items_voucher_id ON voucher_items(voucher_id);
CREATE INDEX idx_voucher_items_ledger_id ON voucher_items(ledger_id);
CREATE INDEX idx_stock_items_group_name ON stock_items(group_name);
CREATE INDEX idx_stock_items_name ON stock_items(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ledgers_updated_at BEFORE UPDATE ON ledgers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update ledger balances
CREATE OR REPLACE FUNCTION update_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
    debit_total DECIMAL(15,2);
    credit_total DECIMAL(15,2);
BEGIN
    -- Calculate total debits for the ledger
    SELECT COALESCE(SUM(amount), 0) INTO debit_total
    FROM voucher_items vi
    JOIN vouchers v ON vi.voucher_id = v.id
    WHERE vi.ledger_id = NEW.ledger_id AND vi.type = 'debit';

    -- Calculate total credits for the ledger
    SELECT COALESCE(SUM(amount), 0) INTO credit_total
    FROM voucher_items vi
    JOIN vouchers v ON vi.voucher_id = v.id
    WHERE vi.ledger_id = NEW.ledger_id AND vi.type = 'credit';

    -- Update the ledger balance
    UPDATE ledgers 
    SET current_balance = opening_balance + debit_total - credit_total
    WHERE id = NEW.ledger_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for balance updates
CREATE TRIGGER update_ledger_balance_after_insert 
AFTER INSERT ON voucher_items 
FOR EACH ROW 
EXECUTE FUNCTION update_ledger_balance();

CREATE TRIGGER update_ledger_balance_after_update 
AFTER UPDATE ON voucher_items 
FOR EACH ROW 
EXECUTE FUNCTION update_ledger_balance();

CREATE TRIGGER update_ledger_balance_after_delete 
AFTER DELETE ON voucher_items 
FOR EACH ROW 
EXECUTE FUNCTION update_ledger_balance();

-- Enable Row Level Security
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow all access to ledgers" ON ledgers FOR ALL USING (true);
CREATE POLICY "Allow all access to vouchers" ON vouchers FOR ALL USING (true);
CREATE POLICY "Allow all access to voucher_items" ON voucher_items FOR ALL USING (true);
CREATE POLICY "Allow all access to stock_items" ON stock_items FOR ALL USING (true);
CREATE POLICY "Allow all access to companies" ON companies FOR ALL USING (true);
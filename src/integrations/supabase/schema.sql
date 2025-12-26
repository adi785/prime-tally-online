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
  rate DECIMAL(15,2) NOT NULL DEFAULT 0,
  value DECIMAL(15,2) NOT NULL DEFAULT 0,
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

-- Create indexes for performance
CREATE INDEX idx_ledgers_group ON ledgers(group);
CREATE INDEX idx_ledgers_name ON ledgers(name);
CREATE INDEX idx_vouchers_type ON vouchers(type);
CREATE INDEX idx_vouchers_date ON vouchers(date);
CREATE INDEX idx_vouchers_party_ledger_id ON vouchers(party_ledger_id);
CREATE INDEX idx_voucher_items_voucher_id ON voucher_items(voucher_id);
CREATE INDEX idx_voucher_items_ledger_id ON voucher_items(ledger_id);
CREATE INDEX idx_stock_items_group_name ON stock_items(group_name);
CREATE INDEX idx_stock_items_name ON stock_items(name);

-- Create triggers for automatic balance updates
CREATE OR REPLACE FUNCTION update_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
  debit_sum DECIMAL(15,2);
  credit_sum DECIMAL(15,2);
BEGIN
  -- Calculate total debits for the ledger
  SELECT COALESCE(SUM(amount), 0) INTO debit_sum
  FROM voucher_items vi
  JOIN vouchers v ON vi.voucher_id = v.id
  WHERE vi.ledger_id = NEW.ledger_id AND vi.type = 'debit';

  -- Calculate total credits for the ledger
  SELECT COALESCE(SUM(amount), 0) INTO credit_sum
  FROM voucher_items vi
  JOIN vouchers v ON vi.voucher_id = v.id
  WHERE vi.ledger_id = NEW.ledger_id AND vi.type = 'credit';

  -- Update the ledger balance
  UPDATE ledgers 
  SET current_balance = opening_balance + debit_sum - credit_sum,
      updated_at = NOW()
  WHERE id = NEW.ledger_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voucher item changes
CREATE TRIGGER trigger_update_ledger_balance
AFTER INSERT OR UPDATE OR DELETE ON voucher_items
FOR EACH ROW EXECUTE FUNCTION update_ledger_balance();

-- Create trigger for voucher amount updates
CREATE OR REPLACE FUNCTION update_voucher_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vouchers 
  SET total_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM voucher_items 
    WHERE voucher_id = NEW.voucher_id
  ),
  updated_at = NOW()
  WHERE id = NEW.voucher_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_voucher_total
AFTER INSERT OR UPDATE OR DELETE ON voucher_items
FOR EACH ROW EXECUTE FUNCTION update_voucher_total();

-- Create trigger for stock value updates
CREATE OR REPLACE FUNCTION update_stock_value()
RETURNS TRIGGER AS $$
BEGIN
  NEW.value = NEW.quantity * NEW.rate;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_value
BEFORE INSERT OR UPDATE ON stock_items
FOR EACH ROW EXECUTE FUNCTION update_stock_value();

-- Enable Row Level Security (RLS)
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ledgers
CREATE POLICY "Users can view their ledgers" ON ledgers
FOR SELECT USING (true);

CREATE POLICY "Users can insert ledgers" ON ledgers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their ledgers" ON ledgers
FOR UPDATE USING (true);

CREATE POLICY "Users can delete their ledgers" ON ledgers
FOR DELETE USING (true);

-- Create RLS policies for vouchers
CREATE POLICY "Users can view their vouchers" ON vouchers
FOR SELECT USING (true);

CREATE POLICY "Users can insert vouchers" ON vouchers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their vouchers" ON vouchers
FOR UPDATE USING (true);

CREATE POLICY "Users can delete their vouchers" ON vouchers
FOR DELETE USING (true);

-- Create RLS policies for voucher_items
CREATE POLICY "Users can view voucher items" ON voucher_items
FOR SELECT USING (true);

CREATE POLICY "Users can insert voucher items" ON voucher_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update voucher items" ON voucher_items
FOR UPDATE USING (true);

CREATE POLICY "Users can delete voucher items" ON voucher_items
FOR DELETE USING (true);

-- Create RLS policies for stock_items
CREATE POLICY "Users can view stock items" ON stock_items
FOR SELECT USING (true);

CREATE POLICY "Users can insert stock items" ON stock_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update stock items" ON stock_items
FOR UPDATE USING (true);

CREATE POLICY "Users can delete stock items" ON stock_items
FOR DELETE USING (true);

-- Create RLS policies for companies
CREATE POLICY "Users can view company info" ON companies
FOR SELECT USING (true);

CREATE POLICY "Users can update company info" ON companies
FOR UPDATE USING (true);

-- Create function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalSales', COALESCE(SUM(CASE WHEN type = 'sales' THEN total_amount ELSE 0 END), 0),
    'totalPurchases', COALESCE(SUM(CASE WHEN type = 'purchase' THEN total_amount ELSE 0 END), 0),
    'totalReceivables', COALESCE(SUM(CASE WHEN group = 'sundry-debtors' THEN current_balance ELSE 0 END), 0),
    'totalPayables', COALESCE(SUM(CASE WHEN group = 'sundry-creditors' THEN current_balance ELSE 0 END), 0),
    'cashInHand', COALESCE(SUM(CASE WHEN group = 'cash-in-hand' THEN current_balance ELSE 0 END), 0),
    'bankBalance', COALESCE(SUM(CASE WHEN group = 'bank-accounts' THEN current_balance ELSE 0 END), 0),
    'todayTransactions', COUNT(DISTINCT CASE WHEN date = CURRENT_DATE THEN vouchers.id END),
    'pendingInvoices', COUNT(DISTINCT CASE WHEN type IN ('sales', 'purchase') AND total_amount > 0 THEN vouchers.id END)
  ) INTO result
  FROM vouchers v
  LEFT JOIN ledgers l ON v.party_ledger_id = l.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO companies (name, address, gstin, pan, phone, email, financial_year_start, financial_year_end) VALUES
('ABC Enterprises Pvt. Ltd.', '123 Business Park, Mumbai, Maharashtra - 400001', '27AABCU9603R1ZM', 'AABCU9603R', '+91 22 2345 6789', 'info@abcenterprises.com', '2024-04-01', '2025-03-31');

INSERT INTO ledgers (name, group, opening_balance, address, phone, gstin, email) VALUES
('Cash', 'cash-in-hand', 50000, NULL, NULL, NULL, NULL),
('HDFC Bank Current A/c', 'bank-accounts', 500000, NULL, NULL, NULL, NULL),
('ICICI Bank Savings', 'bank-accounts', 200000, NULL, NULL, NULL, NULL),
('Reliance Industries Ltd', 'sundry-debtors', 150000, 'Mumbai', '+91 22 1234 5678', '27AABCR1234R1Z5', 'accounts@reliance.com'),
('Tata Motors', 'sundry-debtors', 75000, 'Pune', '+91 20 9876 5432', '27AABCT5678R1Z8', 'finance@tatamotors.com'),
('Mahindra & Mahindra', 'sundry-creditors', -100000, 'Mumbai', '+91 22 5555 1234', '27AABCM9012R1Z1', 'payables@mahindra.com'),
('Larsen & Toubro', 'sundry-creditors', -50000, 'Mumbai', '+91 22 7777 8888', '27AABCL3456R1Z4', 'vendor@lnt.com'),
('Sales - Goods', 'sales-accounts', 0, NULL, NULL, NULL, NULL),
('Sales - Services', 'sales-accounts', 0, NULL, NULL, NULL, NULL),
('Purchase - Raw Materials', 'purchase-accounts', 0, NULL, NULL, NULL, NULL),
('Purchase - Trading Goods', 'purchase-accounts', 0, NULL, NULL, NULL, NULL),
('Rent Expense', 'indirect-expenses', 0, NULL, NULL, NULL, NULL),
('Electricity Expense', 'indirect-expenses', 0, NULL, NULL, NULL, NULL),
('Salary Expense', 'indirect-expenses', 0, NULL, NULL, NULL, NULL),
('Office Equipment', 'fixed-assets', 250000, NULL, NULL, NULL, NULL),
('Furniture & Fixtures', 'fixed-assets', 150000, NULL, NULL, NULL, NULL),
('Interest Income', 'indirect-incomes', 0, NULL, NULL, NULL, NULL);

INSERT INTO stock_items (name, unit, quantity, rate, group_name) VALUES
('Steel Sheets (Grade A)', 'Kg', 2500, 85, 'Raw Materials'),
('Aluminum Bars', 'Kg', 1200, 210, 'Raw Materials'),
('Copper Wire', 'Mtr', 5000, 45, 'Raw Materials'),
('Finished Product A', 'Nos', 150, 2500, 'Finished Goods'),
('Finished Product B', 'Nos', 85, 4500, 'Finished Goods'),
('Packaging Material', 'Box', 500, 25, 'Consumables');

INSERT INTO vouchers (voucher_number, type, date, party_ledger_id, narration, total_amount) VALUES
('SV-001', 'sales', '2024-12-26', (SELECT id FROM ledgers WHERE name = 'Reliance Industries Ltd'), 'Sale of finished goods', 135000),
('PV-001', 'purchase', '2024-12-25', (SELECT id FROM ledgers WHERE name = 'Mahindra & Mahindra'), 'Purchase of raw materials', 75000),
('RV-001', 'receipt', '2024-12-24', (SELECT id FROM ledgers WHERE name = 'Tata Motors'), 'Receipt against invoice', 50000),
('PMT-001', 'payment', '2024-12-23', (SELECT id FROM ledgers WHERE name = 'Larsen & Toubro'), 'Payment for supplies', 100000),
('SV-002', 'sales', '2024-12-22', (SELECT id FROM ledgers WHERE name = 'Tata Motors'), 'Consulting services', 95000);

INSERT INTO voucher_items (voucher_id, ledger_id, amount, type) VALUES
((SELECT id FROM vouchers WHERE voucher_number = 'SV-001'), (SELECT id FROM ledgers WHERE name = 'Sales - Goods'), 135000, 'credit'),
((SELECT id FROM vouchers WHERE voucher_number = 'SV-001'), (SELECT id FROM ledgers WHERE name = 'Reliance Industries Ltd'), 135000, 'debit'),
((SELECT id FROM vouchers WHERE voucher_number = 'PV-001'), (SELECT id FROM ledgers WHERE name = 'Purchase - Raw Materials'), 75000, 'debit'),
((SELECT id FROM vouchers WHERE voucher_number = 'PV-001'), (SELECT id FROM ledgers WHERE name = 'Mahindra & Mahindra'), 75000, 'credit'),
((SELECT id FROM vouchers WHERE voucher_number = 'RV-001'), (SELECT id FROM ledgers WHERE name = 'HDFC Bank Current A/c'), 50000, 'debit'),
((SELECT id FROM vouchers WHERE voucher_number = 'RV-001'), (SELECT id FROM ledgers WHERE name = 'Tata Motors'), 50000, 'credit'),
((SELECT id FROM vouchers WHERE voucher_number = 'PMT-001'), (SELECT id FROM ledgers WHERE name = 'Larsen & Toubro'), 100000, 'debit'),
((SELECT id FROM vouchers WHERE voucher_number = 'PMT-001'), (SELECT id FROM ledgers WHERE name = 'HDFC Bank Current A/c'), 100000, 'credit'),
((SELECT id FROM vouchers WHERE voucher_number = 'SV-002'), (SELECT id FROM ledgers WHERE name = 'Sales - Services'), 95000, 'credit'),
((SELECT id FROM vouchers WHERE voucher_number = 'SV-002'), (SELECT id FROM ledgers WHERE name = 'Tata Motors'), 95000, 'debit');
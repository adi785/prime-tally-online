-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    gstin TEXT NOT NULL,
    pan TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    financial_year_start DATE NOT NULL,
    financial_year_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ledgers table
CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    opening_balance NUMERIC DEFAULT 0,
    current_balance NUMERIC DEFAULT 0,
    address TEXT,
    phone TEXT,
    gstin TEXT,
    email TEXT,
    is_billwise BOOLEAN DEFAULT FALSE,
    is_inventory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vouchers table
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_number TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE NOT NULL,
    party_ledger_id UUID REFERENCES ledgers(id) ON DELETE SET NULL,
    narration TEXT,
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voucher_items table
CREATE TABLE voucher_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
    ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_items table
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    value NUMERIC NOT NULL,
    group_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledgers_updated_at
    BEFORE UPDATE ON ledgers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
    BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_items_updated_at
    BEFORE UPDATE ON stock_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update ledger balances when vouchers are created
CREATE OR REPLACE FUNCTION update_ledger_balances()
RETURNS TRIGGER AS $$
BEGIN
    -- Update party ledger balance
    UPDATE ledgers 
    SET current_balance = current_balance + (
        CASE 
            WHEN NEW.type IN ('sales', 'receipt', 'credit-note') THEN NEW.total_amount
            WHEN NEW.type IN ('purchase', 'payment', 'debit-note') THEN -NEW.total_amount
            ELSE 0
        END
    )
    WHERE id = NEW.party_ledger_id;
    
    -- Update ledger balances for voucher items
    UPDATE ledgers 
    SET current_balance = current_balance + (
        CASE 
            WHEN vi.type = 'debit' THEN vi.amount
            WHEN vi.type = 'credit' THEN -vi.amount
            ELSE 0
        END
    )
    FROM voucher_items vi
    WHERE ledgers.id = vi.ledger_id AND vi.voucher_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ledger_balances_trigger
    AFTER INSERT ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_ledger_balances();

-- Create function to update ledger balance when voucher items change
CREATE OR REPLACE FUNCTION update_ledger_balance_on_item_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update ledger balance based on voucher item change
    UPDATE ledgers 
    SET current_balance = current_balance + (
        CASE 
            WHEN NEW.type = 'debit' THEN NEW.amount
            WHEN NEW.type = 'credit' THEN -NEW.amount
            ELSE 0
        END
    )
    WHERE id = NEW.ledger_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ledger_balance_on_item_insert
    AFTER INSERT ON voucher_items
    FOR EACH ROW EXECUTE FUNCTION update_ledger_balance_on_item_change();

CREATE TRIGGER update_ledger_balance_on_item_update
    AFTER UPDATE ON voucher_items
    FOR EACH ROW EXECUTE FUNCTION update_ledger_balance_on_item_change();

-- Create function to get company info
CREATE OR REPLACE FUNCTION get_company_info()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'address', address,
    'gstin', gstin,
    'pan', pan,
    'phone', phone,
    'email', email,
    'financial_year_start', financial_year_start,
    'financial_year_end', financial_year_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result
  FROM companies 
  LIMIT 1;

  RETURN result;
END;
$$;

-- Create function to update company
CREATE OR REPLACE FUNCTION update_company(
    p_id UUID,
    p_name TEXT,
    p_address TEXT,
    p_gstin TEXT,
    p_pan TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_financial_year_start DATE,
    p_financial_year_end DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE companies 
  SET name = p_name,
      address = p_address,
      gstin = p_gstin,
      pan = p_pan,
      phone = p_phone,
      email = p_email,
      financial_year_start = p_financial_year_start,
      financial_year_end = p_financial_year_end,
      updated_at = NOW()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

-- Create function to get ledger summary
CREATE OR REPLACE FUNCTION get_ledger_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Use the correct column names based on actual table structure
  SELECT jsonb_build_object(
    'total_ledgers', COUNT(*),
    'by_group', jsonb_object_agg(group_name, group_count),
    'total_debit_balance', SUM(CASE WHEN current_balance > 0 THEN current_balance ELSE 0 END),
    'total_credit_balance', SUM(CASE WHEN current_balance < 0 THEN ABS(current_balance) ELSE 0 END)
  ) INTO result
  FROM (
    SELECT 
      group_name,
      COUNT(*) as group_count
    FROM ledgers 
    GROUP BY group_name
  ) as group_counts;

  RETURN result;
END;
$$;

-- Create function to get ledger balance
CREATE OR REPLACE FUNCTION get_ledger_balance(ledger_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  balance NUMERIC := 0;
BEGIN
  SELECT current_balance INTO balance
  FROM ledgers
  WHERE id = ledger_id;
  
  RETURN COALESCE(balance, 0);
END;
$$;

-- Create function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  total_sales NUMERIC := 0;
  total_purchases NUMERIC := 0;
  total_receivables NUMERIC := 0;
  total_payables NUMERIC := 0;
  cash_in_hand NUMERIC := 0;
  bank_balance NUMERIC := 0;
  today_transactions INTEGER := 0;
  pending_invoices INTEGER := 0;
BEGIN
  -- Calculate total sales
  SELECT COALESCE(SUM(total_amount), 0) INTO total_sales
  FROM vouchers WHERE type = 'sales';
  
  -- Calculate total purchases
  SELECT COALESCE(SUM(total_amount), 0) INTO total_purchases
  FROM vouchers WHERE type = 'purchase';
  
  -- Calculate receivables (sundry debtors)
  SELECT COALESCE(SUM(current_balance), 0) INTO total_receivables
  FROM ledgers WHERE group_name = 'sundry-debtors';
  
  -- Calculate payables (sundry creditors)
  SELECT COALESCE(SUM(current_balance), 0) INTO total_payables
  FROM ledgers WHERE group_name = 'sundry-creditors';
  
  -- Calculate cash and bank balances
  SELECT COALESCE(SUM(current_balance), 0) INTO cash_in_hand
  FROM ledgers WHERE group_name = 'cash-in-hand';
  
  SELECT COALESCE(SUM(current_balance), 0) INTO bank_balance
  FROM ledgers WHERE group_name = 'bank-accounts';
  
  -- Calculate today's transactions
  SELECT COUNT(*) INTO today_transactions
  FROM vouchers WHERE date = CURRENT_DATE;
  
  -- Calculate pending invoices (simplified - items with zero balance)
  SELECT COUNT(*) INTO pending_invoices
  FROM ledgers WHERE current_balance = 0 AND group_name IN ('sundry-debtors', 'sundry-creditors');
  
  -- Return as JSON
  result := jsonb_build_object(
    'totalSales', total_sales,
    'totalPurchases', total_purchases,
    'totalReceivables', total_receivables,
    'totalPayables', total_payables,
    'cashInHand', cash_in_hand,
    'bankBalance', bank_balance,
    'todayTransactions', today_transactions,
    'pendingInvoices', pending_invoices,
    'period', jsonb_build_object(
      'start', CURRENT_DATE - INTERVAL '30 days',
      'end', CURRENT_DATE
    )
  );
  
  RETURN result;
END;
$$;

-- Create function to get voucher details
CREATE OR REPLACE FUNCTION get_voucher_details(voucher_id uuid)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'voucher', jsonb_build_object(
      'id', v.id,
      'voucher_number', v.voucher_number,
      'type', v.type,
      'date', v.date,
      'party_ledger_id', v.party_ledger_id,
      'party_name', l.name,
      'narration', v.narration,
      'total_amount', v.total_amount,
      'created_at', v.created_at,
      'updated_at', v.updated_at
    ),
    'items', (
      SELECT json_agg(
        jsonb_build_object(
          'id', vi.id,
          'ledger_id', vi.ledger_id,
          'ledger_name', l2.name,
          'amount', vi.amount,
          'type', vi.type
        )
      )
      FROM voucher_items vi
      LEFT JOIN ledgers l2 ON vi.ledger_id = l2.id
      WHERE vi.voucher_id = v.id
    )
  ) INTO result
  FROM vouchers v
  LEFT JOIN ledgers l ON v.party_ledger_id = l.id
  WHERE v.id = voucher_id;
  
  RETURN result;
END;
$$;

-- Create function to create voucher with number
CREATE OR REPLACE FUNCTION create_voucher_with_number(
    p_voucher_number TEXT,
    p_type TEXT,
    p_date DATE,
    p_party_ledger_id UUID,
    p_narration TEXT,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_voucher_id UUID;
  total_amount NUMERIC := 0;
  item_record JSONB;
BEGIN
  -- Calculate total amount from items
  FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    total_amount := total_amount + (item_record->>'amount')::NUMERIC;
  END LOOP;

  -- Insert voucher
  INSERT INTO vouchers (voucher_number, type, date, party_ledger_id, narration, total_amount)
  VALUES (p_voucher_number, p_type, p_date, p_party_ledger_id, p_narration, total_amount)
  RETURNING id INTO new_voucher_id;

  -- Insert voucher items
  FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO voucher_items (voucher_id, ledger_id, amount, type)
    VALUES (
      new_voucher_id,
      (item_record->>'ledger_id')::UUID,
      (item_record->>'amount')::NUMERIC,
      item_record->>'type'
    );
  END LOOP;

  RETURN new_voucher_id;
END;
$$;

-- Create function to update voucher with items
CREATE OR REPLACE FUNCTION update_voucher_with_items(
    p_voucher_id UUID,
    p_voucher_number TEXT,
    p_type TEXT,
    p_date DATE,
    p_party_ledger_id UUID,
    p_narration TEXT,
    p_items JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_amount NUMERIC := 0;
  item_record JSONB;
  v_total_amount NUMERIC;
BEGIN
  -- Calculate total amount from items
  FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    total_amount := total_amount + (item_record->>'amount')::NUMERIC;
  END LOOP;

  -- Update voucher with explicit alias to avoid ambiguity
  UPDATE vouchers v
  SET voucher_number = p_voucher_number,
      type = p_type,
      date = p_date,
      party_ledger_id = p_party_ledger_id,
      narration = p_narration,
      total_amount = total_amount
  WHERE v.id = p_voucher_id;

  -- Delete existing items
  DELETE FROM voucher_items WHERE voucher_id = p_voucher_id;

  -- Insert new items
  FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO voucher_items (voucher_id, ledger_id, amount, type)
    VALUES (
      p_voucher_id,
      (item_record->>'ledger_id')::UUID,
      (item_record->>'amount')::NUMERIC,
      item_record->>'type'
    );
  END LOOP;

  RETURN TRUE;
END;
$$;

-- Create function to update ledger
CREATE OR REPLACE FUNCTION update_ledger(
    p_id UUID,
    p_name TEXT,
    p_group_name TEXT,
    p_opening_balance NUMERIC,
    p_address TEXT,
    p_phone TEXT,
    p_gstin TEXT,
    p_email TEXT,
    p_is_billwise BOOLEAN,
    p_is_inventory BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ledgers 
  SET name = p_name,
      group_name = p_group_name,
      opening_balance = p_opening_balance,
      address = p_address,
      phone = p_phone,
      gstin = p_gstin,
      email = p_email,
      is_billwise = p_is_billwise,
      is_inventory = p_is_inventory,
      updated_at = NOW()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

-- Create function to update stock item
CREATE OR REPLACE FUNCTION update_stock_item(
    p_id UUID,
    p_name TEXT,
    p_unit TEXT,
    p_quantity NUMERIC,
    p_rate NUMERIC,
    p_group_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE stock_items 
  SET name = p_name,
      unit = p_unit,
      quantity = p_quantity,
      rate = p_rate,
      value = p_quantity * p_rate,
      group_name = p_group_name,
      updated_at = NOW()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

-- Create function to get stock valuation
CREATE OR REPLACE FUNCTION get_stock_valuation()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  total_value NUMERIC := 0;
BEGIN
  SELECT 
    jsonb_build_object(
      'total_items', COUNT(*),
      'total_value', COALESCE(SUM(value), 0),
      'by_group', jsonb_object_agg(group_name, group_total)
    ),
    COALESCE(SUM(value), 0)
  INTO result, total_value
  FROM (
    SELECT 
      group_name,
      SUM(value) as group_total
    FROM stock_items 
    GROUP BY group_name
  ) as group_totals;

  RETURN result;
END;
$$;

-- Create views for reporting

-- Voucher Details View
CREATE VIEW voucher_details AS
SELECT 
    v.id,
    v.voucher_number,
    v.type,
    v.date,
    v.party_ledger_id,
    l.name as party_name,
    v.narration,
    v.total_amount,
    v.created_at,
    v.updated_at,
    json_agg(
        json_build_object(
            'id', vi.id,
            'ledger_id', vi.ledger_id,
            'ledger_name', l2.name,
            'amount', vi.amount,
            'type', vi.type
        )
    ) as items
FROM vouchers v
LEFT JOIN ledgers l ON v.party_ledger_id = l.id
LEFT JOIN voucher_items vi ON v.id = vi.voucher_id
LEFT JOIN ledgers l2 ON vi.ledger_id = l2.id
GROUP BY v.id, v.voucher_number, v.type, v.date, v.party_ledger_id, l.name, v.narration, v.total_amount, v.created_at, v.updated_at;

-- Ledger Summary View
CREATE VIEW ledger_summary AS
SELECT 
    l.id,
    l.name,
    l.group_name,
    l.opening_balance,
    l.current_balance,
    l.address,
    l.phone,
    l.gstin,
    l.email,
    l.is_billwise,
    l.is_inventory,
    l.created_at,
    l.updated_at,
    CASE 
        WHEN l.current_balance > 0 THEN 'Debit'
        WHEN l.current_balance < 0 THEN 'Credit'
        ELSE 'Zero'
    END as balance_type
FROM ledgers l;

-- Financial Statements View
CREATE VIEW financial_statements AS
SELECT 
    'Balance Sheet' as statement_type,
    CASE 
        WHEN l.group_name IN ('cash-in-hand', 'bank-accounts') THEN 'Current Assets'
        WHEN l.group_name IN ('fixed-assets') THEN 'Fixed Assets'
        ELSE 'Other Assets'
    END as category,
    l.name as account_name,
    l.current_balance as amount,
    CASE 
        WHEN l.current_balance > 0 THEN 'Asset'
        ELSE 'Liability'
    END as account_type
FROM ledgers l
WHERE l.group_name IN ('cash-in-hand', 'bank-accounts', 'fixed-assets', 'sundry-creditors', 'capital-account')
UNION ALL
SELECT 
    'Profit & Loss' as statement_type,
    CASE 
        WHEN l.group_name IN ('sales-accounts') THEN 'Income'
        WHEN l.group_name IN ('purchase-accounts', 'direct-expenses', 'indirect-expenses') THEN 'Expenses'
        ELSE 'Other'
    END as category,
    l.name as account_name,
    l.current_balance as amount,
    CASE 
        WHEN l.group_name IN ('sales-accounts') THEN 'Income'
        ELSE 'Expense'
    END as account_type
FROM ledgers l
WHERE l.group_name IN ('sales-accounts', 'purchase-accounts', 'direct-expenses', 'indirect-expenses');

-- Trial Balance View
CREATE VIEW trial_balance AS
SELECT 
    l.name as ledger_name,
    l.group_name,
    CASE 
        WHEN l.current_balance > 0 THEN l.current_balance
        ELSE 0
    END as debit,
    CASE 
        WHEN l.current_balance < 0 THEN ABS(l.current_balance)
        ELSE 0
    END as credit
FROM ledgers l;

-- Ledger Transactions View
CREATE VIEW ledger_transactions AS
SELECT 
    l.id as ledger_id,
    l.name as ledger_name,
    l.group_name,
    v.id as voucher_id,
    v.voucher_number,
    v.type as voucher_type,
    v.date,
    v.narration,
    vi.amount,
    vi.type as transaction_type,
    v.created_at
FROM ledgers l
JOIN voucher_items vi ON l.id = vi.ledger_id
JOIN vouchers v ON vi.voucher_id = v.id
ORDER BY v.date DESC, v.created_at DESC;

-- Account Statements View
CREATE VIEW account_statements AS
SELECT 
    l.id as ledger_id,
    l.name as ledger_name,
    l.group_name,
    v.date,
    v.voucher_number,
    v.type as voucher_type,
    v.narration,
    CASE 
        WHEN vi.type = 'debit' THEN vi.amount
        ELSE 0
    END as debit,
    CASE 
        WHEN vi.type = 'credit' THEN vi.amount
        ELSE 0
    END as credit,
    l.current_balance
FROM ledgers l
JOIN voucher_items vi ON l.id = vi.ledger_id
JOIN vouchers v ON vi.voucher_id = v.id
ORDER BY v.date, v.created_at;

-- GST Reports View
CREATE VIEW gst_reports AS
SELECT 
    v.type as voucher_type,
    v.date,
    l.name as party_name,
    l.gstin,
    v.total_amount,
    (v.total_amount * 0.18) as gst_amount,
    CASE 
        WHEN v.type IN ('sales', 'credit-note') THEN 'Output GST'
        WHEN v.type IN ('purchase', 'debit-note') THEN 'Input GST'
        ELSE 'Other'
    END as gst_type
FROM vouchers v
JOIN ledgers l ON v.party_ledger_id = l.id
WHERE l.gstin IS NOT NULL AND l.gstin != ''
ORDER BY v.date DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "companies_select_policy" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "companies_insert_policy" ON companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "companies_update_policy" ON companies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "companies_delete_policy" ON companies FOR DELETE TO authenticated USING (true);

-- Create RLS policies for ledgers
CREATE POLICY "ledgers_select_policy" ON ledgers FOR SELECT TO authenticated USING (true);
CREATE POLICY "ledgers_insert_policy" ON ledgers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ledgers_update_policy" ON ledgers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "ledgers_delete_policy" ON ledgers FOR DELETE TO authenticated USING (true);

-- Create RLS policies for vouchers
CREATE POLICY "vouchers_select_policy" ON vouchers FOR SELECT TO authenticated USING (true);
CREATE POLICY "vouchers_insert_policy" ON vouchers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vouchers_update_policy" ON vouchers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "vouchers_delete_policy" ON vouchers FOR DELETE TO authenticated USING (true);

-- Create RLS policies for voucher_items
CREATE POLICY "voucher_items_select_policy" ON voucher_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "voucher_items_insert_policy" ON voucher_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "voucher_items_update_policy" ON voucher_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "voucher_items_delete_policy" ON voucher_items FOR DELETE TO authenticated USING (true);

-- Create RLS policies for stock_items
CREATE POLICY "stock_items_select_policy" ON stock_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "stock_items_insert_policy" ON stock_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "stock_items_update_policy" ON stock_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "stock_items_delete_policy" ON stock_items FOR DELETE TO authenticated USING (true);

-- Insert sample data
INSERT INTO companies (name, address, gstin, pan, phone, email, financial_year_start, financial_year_end) VALUES
('ABC Enterprises Pvt. Ltd.', '123 Business Park, Mumbai, Maharashtra - 400001', '27AABCU9603R1ZM', 'AABCU9603R', '+91 22 2345 6789', 'info@abcenterprises.com', '2024-04-01', '2025-03-31');

INSERT INTO ledgers (name, group_name, opening_balance, current_balance, address, phone, gstin, email) VALUES
('Cash', 'cash-in-hand', 50000, 125000, NULL, NULL, NULL, NULL),
('HDFC Bank Current A/c', 'bank-accounts', 500000, 875000, NULL, NULL, NULL, NULL),
('ICICI Bank Savings', 'bank-accounts', 200000, 185000, NULL, NULL, NULL, NULL),
('Reliance Industries Ltd', 'sundry-debtors', 150000, 285000, NULL, NULL, '27AABCR1234R1Z5', NULL),
('Tata Motors', 'sundry-debtors', 75000, 142000, NULL, NULL, '27AABCT5678R1Z8', NULL),
('Infosys Technologies', 'sundry-debtors', 0, 95000, NULL, NULL, '29AABCI1234R1Z2', NULL),
('Mahindra & Mahindra', 'sundry-creditors', -100000, -175000, NULL, NULL, '27AABCM9012R1Z1', NULL),
('Larsen & Toubro', 'sundry-creditors', -50000, -225000, NULL, NULL, '27AABCL3456R1Z4', NULL),
('Sales - Goods', 'sales-accounts', 0, -1250000, NULL, NULL, NULL, NULL),
('Sales - Services', 'sales-accounts', 0, -450000, NULL, NULL, NULL, NULL),
('Purchase - Raw Materials', 'purchase-accounts', 0, 875000, NULL, NULL, NULL, NULL),
('Purchase - Trading Goods', 'purchase-accounts', 0, 425000, NULL, NULL, NULL, NULL),
('Rent Expense', 'indirect-expenses', 0, 120000, NULL, NULL, NULL, NULL),
('Electricity Expense', 'indirect-expenses', 0, 45000, NULL, NULL, NULL, NULL),
('Salary Expense', 'indirect-expenses', 0, 350000, NULL, NULL, NULL, NULL),
('Office Equipment', 'fixed-assets', 250000, 250000, NULL, NULL, NULL, NULL),
('Furniture & Fixtures', 'fixed-assets', 150000, 150000, NULL, NULL, NULL, NULL),
('Interest Income', 'indirect-incomes', 0, -25000, NULL, NULL, NULL, NULL);

INSERT INTO stock_items (name, unit, quantity, rate, value, group_name) VALUES
('Steel Sheets (Grade A)', 'Kg', 2500, 85, 212500, 'Raw Materials'),
('Aluminum Bars', 'Kg', 1200, 210, 252000, 'Raw Materials'),
('Copper Wire', 'Mtr', 5000, 45, 225000, 'Raw Materials'),
('Finished Product A', 'Nos', 150, 2500, 375000, 'Finished Goods'),
('Finished Product B', 'Nos', 85, 4500, 382500, 'Finished Goods'),
('Packaging Material', 'Box', 500, 25, 12500, 'Consumables');

INSERT INTO vouchers (voucher_number, type, date, party_ledger_id, narration, total_amount) VALUES
('SV-001', 'sales', '2024-12-26', (SELECT id FROM ledgers WHERE name = 'Reliance Industries Ltd'), 'Sale of finished goods', 135000),
('PV-001', 'purchase', '2024-12-25', (SELECT id FROM ledgers WHERE name = 'Mahindra & Mahindra'), 'Purchase of raw materials', 75000),
('RV-001', 'receipt', '2024-12-24', (SELECT id FROM ledgers WHERE name = 'Tata Motors'), 'Receipt against invoice', 50000),
('PMT-001', 'payment', '2024-12-23', (SELECT id FROM ledgers WHERE name = 'Larsen & Toubro'), 'Payment for supplies', 100000),
('SV-002', 'sales', '2024-12-22', (SELECT id FROM ledgers WHERE name = 'Infosys Technologies'), 'Consulting services', 95000);

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
((SELECT id FROM vouchers WHERE voucher_number = 'SV-002'), (SELECT id FROM ledgers WHERE name = 'Infosys Technologies'), 95000, 'debit');
-- Enable Row Level Security and add user isolation policies for all user-scoped tables.
-- Each policy restricts rows to the authenticated user via auth.uid().

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON accounts FOR ALL USING (user_id = auth.uid()::text);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON transactions FOR ALL USING (user_id = auth.uid()::text);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON recurring_transactions FOR ALL USING (user_id = auth.uid()::text);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON categories FOR ALL USING (user_id = auth.uid()::text);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON scenarios FOR ALL USING (user_id = auth.uid()::text);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON goals FOR ALL USING (user_id = auth.uid()::text);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON settings FOR ALL USING (user_id = auth.uid()::text);

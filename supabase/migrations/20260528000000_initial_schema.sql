-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id TEXT UNIQUE NOT NULL,
    organizer_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    currency TEXT DEFAULT 'RM' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    share_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'unpaid' NOT NULL CHECK (status IN ('unpaid', 'paid')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Bills Policies
CREATE POLICY "Organizers can view their own bills" ON bills
    FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Public can view bills by short_id" ON bills
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bills" ON bills
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own bills" ON bills
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own bills" ON bills
    FOR DELETE USING (auth.uid() = organizer_id);

-- Participants Policies
CREATE POLICY "Organizers can view participants of their bills" ON participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = participants.bill_id 
            AND bills.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Public can view participants by bill_id" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Organizers can insert participants" ON participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = bill_id 
            AND bills.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Public can update status to paid" ON participants
    FOR UPDATE USING (true)
    WITH CHECK (status = 'paid');

CREATE POLICY "Organizers can update participants" ON participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = participants.bill_id 
            AND bills.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can delete participants" ON participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = participants.bill_id 
            AND bills.organizer_id = auth.uid()
        )
    );

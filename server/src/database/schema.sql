-- Create members table in public schema
CREATE TABLE IF NOT EXISTS public.members (
    id SERIAL PRIMARY KEY,
    membership_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cell_phone VARCHAR(20) NOT NULL,
    inquiry TEXT,
    gender VARCHAR(10),
    date_of_birth DATE,
    hear_about_us VARCHAR(100),
    
    -- Emergency contact info
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_email VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    
    -- Membership status
    status VARCHAR(20) DEFAULT 'pending',
    membership_type VARCHAR(50),
    membership_start_date DATE DEFAULT CURRENT_DATE,
    
    -- Additional fields (optional)
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members(created_at DESC);

-- Function to generate membership number
CREATE OR REPLACE FUNCTION public.generate_membership_number()
RETURNS VARCHAR AS $$
DECLARE
    new_number VARCHAR;
    year_part VARCHAR;
    seq_num INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(membership_number FROM 9) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.members
    WHERE membership_number LIKE 'GYM' || year_part || '%';
    
    -- Format: GYMYYYYXXXXX
    new_number := 'GYM' || year_part || LPAD(seq_num::VARCHAR, 5, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for members table
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();




    
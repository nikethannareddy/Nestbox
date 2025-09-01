-- Add QR code columns to nest_boxes table
ALTER TABLE public.nest_boxes
ADD COLUMN IF NOT EXISTS qr_code_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS last_printed_at TIMESTAMP WITH TIME ZONE;

-- Create a function to generate a unique QR code ID
CREATE OR REPLACE FUNCTION public.generate_qr_code_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    id_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 10-character alphanumeric ID
        new_id := array_to_string(
            ARRAY(
                SELECT substr(
                    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
                    (random() * 32)::int + 1,
                    1
                )
                FROM generate_series(1, 10)
            ),
            ''
        );
        
        -- Check if ID already exists
        SELECT EXISTS (SELECT 1 FROM public.nest_boxes WHERE qr_code_id = new_id) INTO id_exists;
        EXIT WHEN NOT id_exists;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to generate QR code URL
CREATE OR REPLACE FUNCTION public.generate_qr_code_url(qr_id TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.app_domain', true) || 
           '/nestbox/' || qr_id || '/details';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to generate and assign QR code to a nest box
CREATE OR REPLACE FUNCTION public.assign_qr_code_to_nest_box(nest_box_id UUID)
RETURNS JSONB AS $$
DECLARE
    qr_id TEXT;
    qr_url TEXT;
    result JSONB;
BEGIN
    -- Generate a new QR code ID
    SELECT public.generate_qr_code_id() INTO qr_id;
    
    -- Generate QR code URL
    SELECT public.generate_qr_code_url(qr_id) INTO qr_url;
    
    -- Update the nest box with the new QR code
    UPDATE public.nest_boxes
    SET 
        qr_code_id = qr_id,
        qr_code_url = qr_url,
        updated_at = NOW()
    WHERE id = nest_box_id
    RETURNING 
        jsonb_build_object(
            'id', id,
            'qr_code_id', qr_code_id,
            'qr_code_url', qr_code_url
        ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get nest box details by QR code ID
CREATE OR REPLACE FUNCTION public.get_nest_box_by_qr_code(qr_id TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'name', name,
        'location', location,
        'status', status,
        'last_maintenance', last_maintenance,
        'next_maintenance', next_maintenance,
        'qr_code_id', qr_code_id,
        'qr_code_url', qr_code_url,
        'created_at', created_at
    )
    INTO result
    FROM public.nest_boxes
    WHERE qr_code_id = qr_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.generate_qr_code_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_qr_code_url(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_qr_code_to_nest_box(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_nest_box_by_qr_code(TEXT) TO authenticated;

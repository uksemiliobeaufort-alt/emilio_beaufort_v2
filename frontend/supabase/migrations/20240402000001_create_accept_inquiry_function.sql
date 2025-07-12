-- Function to accept a partnership inquiry
CREATE OR REPLACE FUNCTION accept_partnership_inquiry(
  inquiry_id UUID,
  admin_user_id UUID DEFAULT NULL,
  notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  inquiry_record RECORD;
  accepted_record RECORD;
  result JSON;
BEGIN
  -- Get the inquiry details
  SELECT * INTO inquiry_record 
  FROM partnership_inquiries 
  WHERE id = inquiry_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Inquiry not found'
    );
  END IF;
  
  -- Insert into accepted_inquiries
  INSERT INTO accepted_inquiries (
    original_id,
    full_name,
    email,
    company,
    message,
    inquiry_type,
    accepted_by,
    notes
  ) VALUES (
    inquiry_record.id,
    inquiry_record.full_name,
    inquiry_record.email,
    inquiry_record.company,
    inquiry_record.message,
    inquiry_record.inquiry_type,
    admin_user_id,
    notes
  ) RETURNING * INTO accepted_record;
  
  -- Delete from partnership_inquiries
  DELETE FROM partnership_inquiries WHERE id = inquiry_id;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'accepted_inquiry', accepted_record,
    'message', 'Inquiry accepted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_partnership_inquiry(UUID, UUID, TEXT) TO authenticated; 
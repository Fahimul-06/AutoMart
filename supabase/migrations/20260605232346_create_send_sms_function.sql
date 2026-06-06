CREATE OR REPLACE FUNCTION public.send_sms(p_phone text, p_message text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  api_key text;
  api_url text;
  sender_id text;
  sms_url text;
  status text;
  response_body text;
BEGIN
  api_key := current_setting('app.bulk_sms.api_key', true);
  api_url := current_setting('app.bulk_sms.api_url', true);
  sender_id := current_setting('app.bulk_sms.sender_id', true);

  IF api_key IS NULL OR api_url IS NULL OR sender_id IS NULL THEN
    RETURN '{"error": "SMS config not set"}'::jsonb;
  END IF;

  sms_url := api_url || '?api_key=' || encode(api_key::bytea, 'escape') ||
    '&senderid=' || encode(sender_id::bytea, 'escape') ||
    '&number=' || encode(p_phone::bytea, 'escape') ||
    '&message=' || encode(p_message::bytea, 'escape');

  SELECT id INTO request_id FROM net.http_get(
    url := sms_url
  );

  SELECT status_code, body INTO status, response_body
  FROM net.http_collect_response(request_id);

  RETURN jsonb_build_object(
    'status', status,
    'body', response_body
  );
END;
$$;
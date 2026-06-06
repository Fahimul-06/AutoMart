CREATE OR REPLACE FUNCTION public.send_sms(p_phone text, p_message text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  api_key_val text;
  api_url_val text;
  sender_id_val text;
  sms_url text;
  resp_status_code int;
  resp_content text;
BEGIN
  SELECT value INTO api_key_val FROM sms_config WHERE key = 'api_key';
  SELECT value INTO api_url_val FROM sms_config WHERE key = 'api_url';
  SELECT value INTO sender_id_val FROM sms_config WHERE key = 'sender_id';

  IF api_key_val IS NULL OR api_url_val IS NULL OR sender_id_val IS NULL THEN
    RETURN '{"error": "SMS config not set"}'::jsonb;
  END IF;

  sms_url := api_url_val ||
    '?api_key=' || replace(replace(api_key_val, '%', '%25'), '&', '%26') ||
    '&senderid=' || replace(replace(sender_id_val, '%', '%25'), '&', '%26') ||
    '&number=' || replace(replace(p_phone, '%', '%25'), '&', '%26') ||
    '&message=' || replace(replace(p_message, '%', '%25'), '&', '%26');

  request_id := net.http_get(url := sms_url);

  -- pg_net is async, wait briefly then check response
  SELECT status_code, content INTO resp_status_code, resp_content
  FROM net._http_response WHERE id = request_id;

  IF resp_status_code IS NULL THEN
    -- Response not ready yet, return pending status
    RETURN jsonb_build_object(
      'request_id', request_id,
      'status', 'pending'
    );
  END IF;

  RETURN jsonb_build_object(
    'status_code', resp_status_code,
    'content', resp_content
  );
END;
$$;
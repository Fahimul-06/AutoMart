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
  resp_body text;
BEGIN
  api_key_val := current_setting('app.bulksmsbd.api_key', true);
  api_url_val := current_setting('app.bulksmsbd.api_url', true);
  sender_id_val := current_setting('app.bulksmsbd.sender_id', true);

  IF api_key_val IS NULL OR api_url_val IS NULL OR sender_id_val IS NULL THEN
    RETURN '{"error": "SMS config not set in database settings"}'::jsonb;
  END IF;

  sms_url := api_url_val ||
    '?api_key=' || replace(replace(api_key_val, '%', '%25'), '&', '%26') ||
    '&senderid=' || replace(replace(sender_id_val, '%', '%25'), '&', '%26') ||
    '&number=' || replace(replace(p_phone, '%', '%25'), '&', '%26') ||
    '&message=' || replace(replace(p_message, '%', '%25'), '&', '%26');

  SELECT id INTO request_id FROM net.http_get(
    url := sms_url
  );

  SELECT status_code, body INTO resp_status_code, resp_body
  FROM net.http_collect_response(request_id, timeout_milliseconds := 10000);

  RETURN jsonb_build_object(
    'status_code', resp_status_code,
    'body', resp_body
  );
END;
$$;
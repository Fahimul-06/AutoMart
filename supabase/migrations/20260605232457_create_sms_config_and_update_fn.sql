CREATE TABLE IF NOT EXISTS sms_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO sms_config (key, value) VALUES
  ('api_key', 'ww5dMIYUSOK88G1tCY39'),
  ('api_url', 'https://bulksmsbd.net/api/smsapi'),
  ('sender_id', '8809648908087')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

ALTER TABLE sms_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can read sms_config"
  ON sms_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update the send_sms function to read from the table
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
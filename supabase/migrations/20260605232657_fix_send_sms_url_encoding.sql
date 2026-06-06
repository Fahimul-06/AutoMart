CREATE OR REPLACE FUNCTION public.url_encode(text_to_encode text)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  result text := '';
  ch text;
BEGIN
  FOR i IN 1..length(text_to_encode) LOOP
    ch := substring(text_to_encode from i for 1);
    IF ch ~ '[a-zA-Z0-9_.~-]' THEN
      result := result || ch;
    ELSE
      result := result || '%' || upper(lpad(to_hex(ascii(ch)), 2, '0'));
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

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
    '?api_key=' || public.url_encode(api_key_val) ||
    '&senderid=' || public.url_encode(sender_id_val) ||
    '&number=' || public.url_encode(p_phone) ||
    '&message=' || public.url_encode(p_message);

  request_id := net.http_get(url := sms_url);

  SELECT status_code, content INTO resp_status_code, resp_content
  FROM net._http_response WHERE id = request_id;

  IF resp_status_code IS NULL THEN
    RETURN jsonb_build_object('request_id', request_id, 'status', 'pending');
  END IF;

  RETURN jsonb_build_object('status_code', resp_status_code, 'content', resp_content);
END;
$$;
DROP FUNCTION IF EXISTS public.send_sms(text, text);

CREATE OR REPLACE FUNCTION public.send_sms(p_phone text, p_message text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  api_key_val text;
  api_url_val text;
  sender_id_val text;
  sms_url text;
BEGIN
  SELECT value INTO api_key_val FROM sms_config WHERE key = 'api_key';
  SELECT value INTO api_url_val FROM sms_config WHERE key = 'api_url';
  SELECT value INTO sender_id_val FROM sms_config WHERE key = 'sender_id';

  IF api_key_val IS NULL OR api_url_val IS NULL OR sender_id_val IS NULL THEN
    RETURN -1;
  END IF;

  sms_url := api_url_val ||
    '?api_key=' || public.url_encode(api_key_val) ||
    '&senderid=' || public.url_encode(sender_id_val) ||
    '&number=' || public.url_encode(p_phone) ||
    '&message=' || public.url_encode(p_message);

  request_id := net.http_get(url := sms_url);

  RETURN request_id;
END;
$$;
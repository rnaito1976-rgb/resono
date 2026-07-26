-- Conversation list summaries (latest message + unread per thread).
CREATE OR REPLACE FUNCTION get_conversation_summaries(p_member_id text)
RETURNS TABLE (
  conversation_id uuid,
  partner_id text,
  last_message_id uuid,
  last_message_body text,
  last_message_sender_id text,
  last_message_at timestamptz,
  unread_count integer,
  conversation_created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    CASE
      WHEN c.member_a_id = p_member_id THEN c.member_b_id
      ELSE c.member_a_id
    END,
    lm.id,
    lm.body,
    lm.sender_member_id,
    lm.created_at,
    COALESCE(uc.cnt, 0)::integer,
    c.created_at
  FROM conversations c
  LEFT JOIN LATERAL (
    SELECT id, body, sender_member_id, created_at
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::integer AS cnt
    FROM messages m
    LEFT JOIN conversation_reads r
      ON r.conversation_id = c.id
      AND r.member_id = p_member_id
    WHERE m.conversation_id = c.id
      AND m.sender_member_id <> p_member_id
      AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at)
  ) uc ON true
  WHERE c.member_a_id = p_member_id OR c.member_b_id = p_member_id
  ORDER BY COALESCE(lm.created_at, c.created_at) DESC;
$$;

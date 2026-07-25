-- Efficient unread badge count (avoids loading all message rows).
CREATE OR REPLACE FUNCTION get_unread_message_count(p_member_id text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM messages m
  INNER JOIN conversations c ON c.id = m.conversation_id
  LEFT JOIN conversation_reads r
    ON r.conversation_id = m.conversation_id
    AND r.member_id = p_member_id
  WHERE (c.member_a_id = p_member_id OR c.member_b_id = p_member_id)
    AND m.sender_member_id <> p_member_id
    AND (r.last_read_at IS NULL OR m.created_at > r.last_read_at);
$$;

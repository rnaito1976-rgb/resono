-- Efficient band unread counts (avoids loading all timeline rows).
CREATE OR REPLACE FUNCTION get_band_unread_summary(p_member_id text)
RETURNS TABLE (band_id uuid, unread_count integer)
LANGUAGE sql
STABLE
AS $$
  SELECT
    bm.band_id,
    COUNT(*)::integer AS unread_count
  FROM band_members bm
  LEFT JOIN band_member_reads r
    ON r.band_id = bm.band_id
    AND r.member_id = p_member_id
  INNER JOIN band_timeline_events e
    ON e.band_id = bm.band_id
  LEFT JOIN band_activities a
    ON a.id = e.activity_id
    AND a.author_member_id = p_member_id
  WHERE bm.member_id = p_member_id
    AND (r.last_seen_at IS NULL OR e.occurred_at > r.last_seen_at)
    AND a.id IS NULL
  GROUP BY bm.band_id
  HAVING COUNT(*) > 0;
$$;

CREATE OR REPLACE FUNCTION get_band_unread_count(p_member_id text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(unread_count), 0)::integer
  FROM get_band_unread_summary(p_member_id);
$$;

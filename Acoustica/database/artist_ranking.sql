CREATE OR REPLACE FUNCTION fn_base_artist_stats()
RETURNS TABLE (
    artist_id            INT,
    total_streams        BIGINT,
    unique_listeners     BIGINT,
    streams_last_7d      BIGINT,
    unique_listeners_7d  BIGINT,
    saves_7d             BIGINT,
    likes_7d             BIGINT,
    streams_today        BIGINT,
    streams_yesterday    BIGINT,
    total_followers      BIGINT,
    new_followers_7d     BIGINT
)
LANGUAGE sql STABLE AS $$
    WITH
    all_time AS (
        SELECT  sa.artist_id,
                COUNT(*)                        AS total_streams,
                COUNT(DISTINCT ssh.listener_id) AS unique_listeners
        FROM    song_stream_history ssh
        JOIN    song_artist sa ON sa.song_id = ssh.song_id
        GROUP BY sa.artist_id
    ),
    last7 AS (
        SELECT  sa.artist_id,
                COUNT(*)                        AS streams_last_7d,
                COUNT(DISTINCT ssh.listener_id) AS unique_listeners_7d
        FROM    song_stream_history ssh
        JOIN    song_artist sa ON sa.song_id = ssh.song_id
        WHERE   ssh.date_time >= NOW() - INTERVAL '7 days'
        GROUP BY sa.artist_id
    ),
    saves AS (
        SELECT  sa.artist_id,
                COUNT(*) AS saves_7d
        FROM    playlist_song ps
        JOIN    playlist    p  ON p.playlist_id  = ps.playlist_id
        JOIN    song_artist sa ON sa.song_id     = ps.song_id
        WHERE   p.creation_date >= CURRENT_DATE - 7
        GROUP BY sa.artist_id
    ),
    likes AS (
        SELECT  sa.artist_id,
                COUNT(*) AS likes_7d
        FROM    liked_song ls
        JOIN    song_artist sa ON sa.song_id = ls.song_id
        WHERE   ls.date_time >= NOW() - INTERVAL '7 days'
        GROUP BY sa.artist_id
    ),
    today_streams AS (
        SELECT  sa.artist_id, COUNT(*) AS streams_today
        FROM    song_stream_history ssh
        JOIN    song_artist sa ON sa.song_id = ssh.song_id
        WHERE   ssh.date_time::date = CURRENT_DATE
        GROUP BY sa.artist_id
    ),
    yesterday_streams AS (
        SELECT  sa.artist_id, COUNT(*) AS streams_yesterday
        FROM    song_stream_history ssh
        JOIN    song_artist sa ON sa.song_id = ssh.song_id
        WHERE   ssh.date_time::date = CURRENT_DATE - 1
        GROUP BY sa.artist_id
    ),
    followers AS (
        SELECT  fa.artist_id,
                COUNT(*)                                             AS total_followers,
                COUNT(*) FILTER (
                    WHERE fa.date_time >= NOW() - INTERVAL '7 days'
                )                                                    AS new_followers_7d
        FROM    followed_artist fa
        GROUP BY fa.artist_id
    )
    SELECT
        ar.artist_id,
        COALESCE(at.total_streams,        0),
        COALESCE(at.unique_listeners,     0),
        COALESCE(l7.streams_last_7d,      0),
        COALESCE(l7.unique_listeners_7d,  0),
        COALESCE(sv.saves_7d,             0),
        COALESCE(lk.likes_7d,             0),
        COALESCE(td.streams_today,        0),
        COALESCE(yd.streams_yesterday,    0),
        COALESCE(fl.total_followers,      0),
        COALESCE(fl.new_followers_7d,     0)
    FROM            artist            ar
    LEFT JOIN       all_time          at  ON at.artist_id = ar.artist_id
    LEFT JOIN       last7             l7  ON l7.artist_id = ar.artist_id
    LEFT JOIN       saves             sv  ON sv.artist_id = ar.artist_id
    LEFT JOIN       likes             lk  ON lk.artist_id = ar.artist_id
    LEFT JOIN       today_streams     td  ON td.artist_id = ar.artist_id
    LEFT JOIN       yesterday_streams yd  ON yd.artist_id = ar.artist_id
    LEFT JOIN       followers         fl  ON fl.artist_id = ar.artist_id;
$$;


CREATE OR REPLACE FUNCTION fn_popular_artist_score(
    p_total_streams    BIGINT,
    p_unique_listeners BIGINT,
    p_total_followers  BIGINT
)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE AS $$
    SELECT  0.5 * LOG(GREATEST(p_total_streams,    1)::NUMERIC)
          + 0.3 * LOG(GREATEST(p_unique_listeners, 1)::NUMERIC)
          + 0.2 * LOG(GREATEST(p_total_followers,  1)::NUMERIC);
$$;


CREATE OR REPLACE FUNCTION fn_trending_artist_score(
    norm_streams_7d      NUMERIC,
    norm_growth_rate     NUMERIC,
    norm_unique_7d       NUMERIC,
    norm_new_followers   NUMERIC,
    norm_likes_7d        NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE AS $$
    SELECT  0.35 * norm_streams_7d
          + 0.25 * norm_growth_rate
          + 0.15 * norm_unique_7d
          + 0.15 * norm_new_followers
          + 0.10 * norm_likes_7d;
$$;


CREATE OR REPLACE FUNCTION fn_popular_artists(
    p_limit       INT DEFAULT 50,
    p_genre_id    INT DEFAULT NULL,
    p_mood_id     INT DEFAULT NULL,
    p_language_id INT DEFAULT NULL
)
RETURNS TABLE (
    artist_id        INT,
    artist_name      TEXT,
    popular_score    NUMERIC,
    total_streams    BIGINT,
    unique_listeners BIGINT,
    total_followers  BIGINT
)
LANGUAGE sql STABLE AS $$
    SELECT
        ar.artist_id,
        ar.stage_name                   AS artist_name,
        fn_popular_artist_score(
            bas.total_streams,
            bas.unique_listeners,
            bas.total_followers
        )                               AS popular_score,
        bas.total_streams,
        bas.unique_listeners,
        bas.total_followers
    FROM   artist ar
    JOIN   fn_base_artist_stats() bas ON bas.artist_id = ar.artist_id
    WHERE  (p_genre_id    IS NULL OR EXISTS (
                SELECT 1 FROM song_artist sa
                JOIN song_genre sg ON sg.song_id = sa.song_id
                WHERE  sa.artist_id = ar.artist_id AND sg.genre_id = p_genre_id))
    AND    (p_mood_id     IS NULL OR EXISTS (
                SELECT 1 FROM song_artist sa
                JOIN song_mood sm ON sm.song_id = sa.song_id
                WHERE  sa.artist_id = ar.artist_id AND sm.mood_id = p_mood_id))
    AND    (p_language_id IS NULL OR EXISTS (
                SELECT 1 FROM song_artist sa
                JOIN song s ON s.song_id = sa.song_id
                WHERE  sa.artist_id = ar.artist_id AND s.language_id = p_language_id))
    ORDER  BY popular_score DESC
    LIMIT  p_limit;
$$;


CREATE OR REPLACE FUNCTION fn_trending_artists(
    p_limit       INT DEFAULT 50,
    p_genre_id    INT DEFAULT NULL,
    p_mood_id     INT DEFAULT NULL,
    p_language_id INT DEFAULT NULL
)
RETURNS TABLE (
    artist_id        INT,
    artist_name      TEXT,
    trending_score   NUMERIC,
    streams_last_7d  BIGINT,
    growth_rate      NUMERIC,
    new_followers_7d BIGINT
)
LANGUAGE sql STABLE AS $$
    WITH
    filtered AS (
        SELECT
            ar.artist_id,
            ar.stage_name               AS artist_name,
            bas.streams_last_7d,
            bas.unique_listeners_7d,
            bas.new_followers_7d,
            bas.likes_7d,
            (bas.streams_today - bas.streams_yesterday)::NUMERIC
                / (bas.streams_yesterday + 50) AS growth_rate
        FROM   artist ar
        JOIN   fn_base_artist_stats() bas ON bas.artist_id = ar.artist_id
        WHERE  (p_genre_id    IS NULL OR EXISTS (
                    SELECT 1 FROM song_artist sa
                    JOIN song_genre sg ON sg.song_id = sa.song_id
                    WHERE  sa.artist_id = ar.artist_id AND sg.genre_id = p_genre_id))
        AND    (p_mood_id     IS NULL OR EXISTS (
                    SELECT 1 FROM song_artist sa
                    JOIN song_mood sm ON sm.song_id = sa.song_id
                    WHERE  sa.artist_id = ar.artist_id AND sm.mood_id = p_mood_id))
        AND    (p_language_id IS NULL OR EXISTS (
                    SELECT 1 FROM song_artist sa
                    JOIN song s ON s.song_id = sa.song_id
                    WHERE  sa.artist_id = ar.artist_id AND s.language_id = p_language_id))
    ),
    maxes AS (
        SELECT
            GREATEST(MAX(f.streams_last_7d),    1)     AS max_s7d,
            GREATEST(MAX(f.growth_rate),        0.001) AS max_gr,
            GREATEST(MAX(f.unique_listeners_7d),1)     AS max_ul7d,
            GREATEST(MAX(f.new_followers_7d),   1)     AS max_nf7d,
            GREATEST(MAX(f.likes_7d),           1)     AS max_lk7d
        FROM filtered f
    )
    SELECT
        f.artist_id,
        f.artist_name,
        fn_trending_artist_score(
            f.streams_last_7d::NUMERIC         / m.max_s7d,
            GREATEST(f.growth_rate, 0)         / m.max_gr,
            f.unique_listeners_7d::NUMERIC     / m.max_ul7d,
            f.new_followers_7d::NUMERIC        / m.max_nf7d,
            f.likes_7d::NUMERIC                / m.max_lk7d
        )                                       AS trending_score,
        f.streams_last_7d,
        f.growth_rate,
        f.new_followers_7d
    FROM   filtered f
    CROSS JOIN maxes m
    ORDER  BY trending_score DESC
    LIMIT  p_limit;
$$;


CREATE OR REPLACE FUNCTION fn_get_popular_artists(
    p_limit       INT DEFAULT 10,
    p_genre_id    INT DEFAULT NULL,
    p_mood_id     INT DEFAULT NULL,
    p_language_id INT DEFAULT NULL
)
RETURNS TABLE (
    artist_id       INT,
    artist_name     TEXT,
    profile_picture TEXT
)
LANGUAGE sql STABLE AS $$
    SELECT
        p.artist_id,
        p.artist_name,
        u.profile_picture
    FROM fn_popular_artists(p_limit, p_genre_id, p_mood_id, p_language_id) p
    JOIN artist ar ON ar.artist_id = p.artist_id
    JOIN users  u  ON u.user_id    = ar.artist_id
    ORDER BY p.popular_score DESC;
$$;


CREATE OR REPLACE FUNCTION fn_get_trending_artists(
    p_limit       INT DEFAULT 10,
    p_genre_id    INT DEFAULT NULL,
    p_mood_id     INT DEFAULT NULL,
    p_language_id INT DEFAULT NULL
)
RETURNS TABLE (
    artist_id       INT,
    artist_name     TEXT,
    profile_picture TEXT
)
LANGUAGE sql STABLE AS $$
    SELECT
        t.artist_id,
        t.artist_name,
        u.profile_picture
    FROM fn_trending_artists(p_limit, p_genre_id, p_mood_id, p_language_id) t
    JOIN artist ar ON ar.artist_id = t.artist_id
    JOIN users  u  ON u.user_id    = ar.artist_id
    ORDER BY t.trending_score DESC;
$$;

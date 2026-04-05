CREATE OR REPLACE FUNCTION fn_base_song_stats()
RETURNS TABLE (
    song_id             INT,
    total_streams       BIGINT,
    unique_listeners    BIGINT,
    streams_last_7d     BIGINT,
    unique_listeners_7d BIGINT,
    saves_7d            BIGINT,
    likes_7d            BIGINT,
    streams_today       BIGINT,
    streams_yesterday   BIGINT
)
LANGUAGE sql STABLE AS $$
    WITH
    all_time AS (
        SELECT  ssh.song_id,
                COUNT(*)                        AS total_streams,
                COUNT(DISTINCT ssh.listener_id) AS unique_listeners
        FROM    song_stream_history ssh
        GROUP BY ssh.song_id
    ),
    last7 AS (
        SELECT  ssh.song_id,
                COUNT(*)                        AS streams_last_7d,
                COUNT(DISTINCT ssh.listener_id) AS unique_listeners_7d
        FROM    song_stream_history ssh
        WHERE   ssh.date_time >= NOW() - INTERVAL '7 days'
        GROUP BY ssh.song_id
    ),
    saves AS (
        SELECT  ps.song_id,
                COUNT(*) AS saves_7d
        FROM    playlist_song ps
        JOIN    playlist p ON p.playlist_id = ps.playlist_id
        WHERE   p.creation_date >= CURRENT_DATE - 7
        GROUP BY ps.song_id
    ),
    likes AS (
        -- previously all-time; now correctly scoped to last 7 days
        SELECT  ls.song_id,
                COUNT(*) AS likes_7d
        FROM    liked_song ls
        WHERE   ls.date_time >= NOW() - INTERVAL '7 days'
        GROUP BY ls.song_id
    ),
    today_streams AS (
        SELECT  ssh.song_id, COUNT(*) AS streams_today
        FROM    song_stream_history ssh
        WHERE   ssh.date_time::date = CURRENT_DATE
        GROUP BY ssh.song_id
    ),
    yesterday_streams AS (
        SELECT  ssh.song_id, COUNT(*) AS streams_yesterday
        FROM    song_stream_history ssh
        WHERE   ssh.date_time::date = CURRENT_DATE - 1
        GROUP BY ssh.song_id
    )
    SELECT
        s.song_id,
        COALESCE(at.total_streams,       0),
        COALESCE(at.unique_listeners,    0),
        COALESCE(l7.streams_last_7d,     0),
        COALESCE(l7.unique_listeners_7d, 0),
        COALESCE(sv.saves_7d,            0),
        COALESCE(lk.likes_7d,            0),
        COALESCE(td.streams_today,       0),
        COALESCE(yd.streams_yesterday,   0)
    FROM            song              s
    LEFT JOIN       all_time          at  ON at.song_id = s.song_id
    LEFT JOIN       last7             l7  ON l7.song_id = s.song_id
    LEFT JOIN       saves             sv  ON sv.song_id = s.song_id
    LEFT JOIN       likes             lk  ON lk.song_id = s.song_id
    LEFT JOIN       today_streams     td  ON td.song_id = s.song_id
    LEFT JOIN       yesterday_streams yd  ON yd.song_id = s.song_id;
$$;


-- 0.2  Popular score
CREATE OR REPLACE FUNCTION fn_popular_score(
    p_total_streams    BIGINT,
    p_unique_listeners BIGINT
)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE AS $$
    SELECT  0.6 * LOG(GREATEST(p_total_streams,    1)::NUMERIC)
          + 0.4 * LOG(GREATEST(p_unique_listeners, 1)::NUMERIC);
$$;


-- 0.3  Trending score
CREATE OR REPLACE FUNCTION fn_trending_score(
    norm_streams_7d  NUMERIC,
    norm_growth_rate NUMERIC,
    norm_unique_7d   NUMERIC,
    norm_saves_7d    NUMERIC,
    norm_likes_7d    NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE AS $$
    SELECT  0.35 * norm_streams_7d
          + 0.25 * norm_growth_rate
          + 0.15 * norm_unique_7d
          + 0.15 * norm_saves_7d
          + 0.10 * norm_likes_7d;
$$;


-- 0.4  Combined recommendation score
CREATE OR REPLACE FUNCTION fn_combined_score(
    p_popular_score  NUMERIC,
    p_trending_score NUMERIC,
    p_similarity     NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE AS $$
    SELECT  0.5 * p_popular_score
          + 0.2 * p_trending_score
          + 0.3 * p_similarity;
$$;

-- ============================================================
-- SECTION 1: fn_popular_songs
-- ============================================================
CREATE OR REPLACE FUNCTION fn_popular_songs(
    p_limit         INT DEFAULT 50,
    p_genre_id      INT DEFAULT NULL,
    p_mood_id       INT DEFAULT NULL,
    p_language_id   INT DEFAULT NULL,
    p_instrument_id INT DEFAULT NULL,
    p_artist_id     INT DEFAULT NULL        -- NEW
)
RETURNS TABLE (
    song_id          INT,
    title            TEXT,
    popular_score    NUMERIC,
    total_streams    BIGINT,
    unique_listeners BIGINT
)
LANGUAGE sql STABLE AS $$
    SELECT
        s.song_id,
        s.title,
        fn_popular_score(bs.total_streams, bs.unique_listeners) AS popular_score,
        bs.total_streams,
        bs.unique_listeners
    FROM   song s
    JOIN   fn_base_song_stats() bs ON bs.song_id = s.song_id
    WHERE  (p_genre_id      IS NULL OR EXISTS (
                SELECT 1 FROM song_genre sg
                WHERE  sg.song_id = s.song_id AND sg.genre_id = p_genre_id))
    AND    (p_mood_id       IS NULL OR EXISTS (
                SELECT 1 FROM song_mood sm
                WHERE  sm.song_id = s.song_id AND sm.mood_id  = p_mood_id))
    AND    (p_language_id   IS NULL OR s.language_id = p_language_id)
    AND    (p_instrument_id IS NULL OR EXISTS (
                SELECT 1 FROM song_instrument si
                WHERE  si.song_id = s.song_id AND si.instrument_id = p_instrument_id))
    AND    (p_artist_id     IS NULL OR EXISTS (        -- NEW
                SELECT 1 FROM song_artist sa
                WHERE  sa.song_id = s.song_id AND sa.artist_id = p_artist_id))
    ORDER  BY popular_score DESC
    LIMIT  p_limit;
$$;


-- ============================================================
-- SECTION 2: fn_trending_songs
-- ============================================================
CREATE OR REPLACE FUNCTION fn_trending_songs(
    p_limit         INT DEFAULT 50,
    p_genre_id      INT DEFAULT NULL,
    p_mood_id       INT DEFAULT NULL,
    p_language_id   INT DEFAULT NULL,
    p_instrument_id INT DEFAULT NULL,
    p_artist_id     INT DEFAULT NULL        -- NEW
)
RETURNS TABLE (
    song_id         INT,
    title           TEXT,
    trending_score  NUMERIC,
    streams_last_7d BIGINT,
    growth_rate     NUMERIC
)
LANGUAGE sql STABLE AS $$
    WITH
    filtered AS (
        SELECT
            s.song_id,
            s.title,
            bs.streams_last_7d,
            bs.unique_listeners_7d,
            bs.saves_7d,
            bs.likes_7d,
            (bs.streams_today - bs.streams_yesterday)::NUMERIC
                / (bs.streams_yesterday + 50) AS growth_rate
        FROM   song s
        JOIN   fn_base_song_stats() bs ON bs.song_id = s.song_id
        WHERE  (p_genre_id      IS NULL OR EXISTS (
                    SELECT 1 FROM song_genre sg
                    WHERE  sg.song_id = s.song_id AND sg.genre_id = p_genre_id))
        AND    (p_mood_id       IS NULL OR EXISTS (
                    SELECT 1 FROM song_mood sm
                    WHERE  sm.song_id = s.song_id AND sm.mood_id  = p_mood_id))
        AND    (p_language_id   IS NULL OR s.language_id = p_language_id)
        AND    (p_instrument_id IS NULL OR EXISTS (
                    SELECT 1 FROM song_instrument si
                    WHERE  si.song_id = s.song_id AND si.instrument_id = p_instrument_id))
        AND    (p_artist_id     IS NULL OR EXISTS (    -- NEW
                    SELECT 1 FROM song_artist sa
                    WHERE  sa.song_id = s.song_id AND sa.artist_id = p_artist_id))
    ),
    maxes AS (
        SELECT
            GREATEST(MAX(f.streams_last_7d),    1)     AS max_s7d,
            GREATEST(MAX(f.growth_rate),        0.001) AS max_gr,
            GREATEST(MAX(f.unique_listeners_7d),1)     AS max_ul7d,
            GREATEST(MAX(f.saves_7d),           1)     AS max_sv7d,
            GREATEST(MAX(f.likes_7d),           1)     AS max_lk7d
        FROM filtered f
    )
    SELECT
        f.song_id,
        f.title,
        fn_trending_score(
            f.streams_last_7d::NUMERIC         / m.max_s7d,
            GREATEST(f.growth_rate, 0)         / m.max_gr,
            f.unique_listeners_7d::NUMERIC     / m.max_ul7d,
            f.saves_7d::NUMERIC                / m.max_sv7d,
            f.likes_7d::NUMERIC                / m.max_lk7d
        )                                       AS trending_score,
        f.streams_last_7d,
        f.growth_rate
    FROM   filtered f
    CROSS JOIN maxes m
    ORDER  BY trending_score DESC
    LIMIT  p_limit;
$$;


-- ============================================================
-- SECTION 3: fn_recommended_songs
-- ============================================================
CREATE OR REPLACE FUNCTION fn_recommended_songs(
    p_user_id       INT,
    p_limit         INT DEFAULT 50,
    p_genre_id      INT DEFAULT NULL,
    p_mood_id       INT DEFAULT NULL,
    p_language_id   INT DEFAULT NULL,
    p_instrument_id INT DEFAULT NULL,
    p_artist_id     INT DEFAULT NULL        -- NEW
)
RETURNS TABLE (
    song_id   INT,
    title     TEXT,
    rec_score NUMERIC,
    bucket    TEXT
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_total_plays    BIGINT;
    v_bucket_limit_1 INT;
    v_bucket_limit_2 INT;
    v_bucket_limit_3 INT;
    v_bucket_limit_4 INT;
BEGIN
    v_bucket_limit_1 := CEIL(p_limit * 0.15);
    v_bucket_limit_2 := CEIL(p_limit * 0.15);
    v_bucket_limit_3 := CEIL(p_limit * 0.23);
    v_bucket_limit_4 := CEIL(p_limit * 0.22);

    SELECT COUNT(*) INTO v_total_plays
    FROM   song_stream_history ssh
    WHERE  ssh.listener_id = p_user_id;

    IF v_total_plays = 0 THEN v_total_plays := 1; END IF;

    RETURN QUERY
    WITH
    stats AS (
        SELECT * FROM fn_base_song_stats()
    ),
    maxes AS (
        SELECT
            GREATEST(MAX(st.streams_last_7d),     1)     AS max_s7d,
            GREATEST(MAX(
                (st.streams_today - st.streams_yesterday)::NUMERIC
                / (st.streams_yesterday + 50)
            ), 0.001)                                     AS max_gr,
            GREATEST(MAX(st.unique_listeners_7d), 1)     AS max_ul7d,
            GREATEST(MAX(st.saves_7d),            1)     AS max_sv7d,
            GREATEST(MAX(st.likes_7d),            1)     AS max_lk7d
        FROM stats st
    ),
    scored_songs AS (
        SELECT
            s.song_id                                                        AS song_id,
            s.title                                                          AS title,
            fn_popular_score(bs.total_streams, bs.unique_listeners)          AS pop_score,
            fn_trending_score(
                bs.streams_last_7d::NUMERIC          / m.max_s7d,
                GREATEST((bs.streams_today - bs.streams_yesterday)::NUMERIC
                    / (bs.streams_yesterday + 50), 0) / m.max_gr,
                bs.unique_listeners_7d::NUMERIC      / m.max_ul7d,
                bs.saves_7d::NUMERIC                 / m.max_sv7d,
                bs.likes_7d::NUMERIC                 / m.max_lk7d
            )                                                                AS trend_score
        FROM   song s
        JOIN   stats bs ON bs.song_id = s.song_id
        CROSS JOIN maxes m
        WHERE  (p_genre_id      IS NULL OR EXISTS (
                    SELECT 1 FROM song_genre sg
                    WHERE  sg.song_id = s.song_id AND sg.genre_id = p_genre_id))
        AND    (p_mood_id       IS NULL OR EXISTS (
                    SELECT 1 FROM song_mood sm
                    WHERE  sm.song_id = s.song_id AND sm.mood_id  = p_mood_id))
        AND    (p_language_id   IS NULL OR s.language_id = p_language_id)
        AND    (p_instrument_id IS NULL OR EXISTS (
                    SELECT 1 FROM song_instrument si
                    WHERE  si.song_id = s.song_id AND si.instrument_id = p_instrument_id))
        AND    (p_artist_id     IS NULL OR EXISTS (    -- NEW
                    SELECT 1 FROM song_artist sa
                    WHERE  sa.song_id = s.song_id AND sa.artist_id = p_artist_id))
    ),
    -- rest of buckets unchanged from here ...
    user_liked_artists AS (
        SELECT DISTINCT sa.artist_id
        FROM   liked_song ls
        JOIN   song_artist sa ON sa.song_id = ls.song_id
        WHERE  ls.listener_id = p_user_id
        UNION
        SELECT DISTINCT sa.artist_id
        FROM   playlist_song ps
        JOIN   playlist    pl ON pl.playlist_id = ps.playlist_id
        JOIN   song_artist sa ON sa.song_id     = ps.song_id
        WHERE  pl.creator_id = p_user_id
    ),
    plays_per_artist AS (
        SELECT sa.artist_id, COUNT(*) AS plays
        FROM   song_stream_history ssh
        JOIN   song_artist sa ON sa.song_id = ssh.song_id
        WHERE  ssh.listener_id = p_user_id
        GROUP BY sa.artist_id
    ),
    bucket1 AS (
        SELECT DISTINCT ON (ss.song_id)
               ss.song_id                                AS song_id,
               ss.title                                  AS title,
               fn_combined_score(
                   ss.pop_score, ss.trend_score,
                   COALESCE(ppa.plays, 0)::NUMERIC / v_total_plays
               )                                         AS rec_score,
               'liked_artist_songs'::TEXT                AS bucket
        FROM   scored_songs ss
        JOIN   song_artist        sa  ON sa.song_id    = ss.song_id
        JOIN   user_liked_artists ula ON ula.artist_id = sa.artist_id
        LEFT JOIN plays_per_artist ppa ON ppa.artist_id = sa.artist_id
        ORDER  BY ss.song_id, rec_score DESC
        LIMIT  v_bucket_limit_1
    ),
    listened_artists AS (
        SELECT DISTINCT sa.artist_id
        FROM   song_stream_history ssh
        JOIN   song_artist sa ON sa.song_id = ssh.song_id
        WHERE  ssh.listener_id = p_user_id
    ),
    collaborator_artists AS (
        SELECT DISTINCT sa2.artist_id
        FROM   song_artist sa1
        JOIN   listened_artists  la  ON la.artist_id   = sa1.artist_id
        JOIN   song_artist       sa2 ON sa2.song_id    = sa1.song_id
                                    AND sa2.artist_id <> sa1.artist_id
        WHERE  sa2.artist_id NOT IN (SELECT ula.artist_id FROM user_liked_artists ula)
    ),
    bucket2 AS (
        SELECT DISTINCT ON (ss.song_id)
               ss.song_id                                AS song_id,
               ss.title                                  AS title,
               fn_combined_score(
                   ss.pop_score, ss.trend_score,
                   COALESCE(ppa.plays, 0)::NUMERIC / v_total_plays
               )                                         AS rec_score,
               'collaborator_songs'::TEXT                AS bucket
        FROM   scored_songs ss
        JOIN   song_artist          sa  ON sa.song_id    = ss.song_id
        JOIN   collaborator_artists ca  ON ca.artist_id  = sa.artist_id
        LEFT JOIN plays_per_artist  ppa ON ppa.artist_id = sa.artist_id
        AND    ss.song_id NOT IN (SELECT b1.song_id FROM bucket1 b1)
        ORDER  BY ss.song_id, rec_score DESC
        LIMIT  v_bucket_limit_2
    ),
    plays_per_mood AS (
        SELECT sm.mood_id, COUNT(*) AS plays
        FROM   song_stream_history ssh
        JOIN   song_mood sm ON sm.song_id = ssh.song_id
        WHERE  ssh.listener_id = p_user_id
        GROUP BY sm.mood_id
    ),
    bucket3 AS (
        SELECT DISTINCT ON (ss.song_id)
               ss.song_id                                AS song_id,
               ss.title                                  AS title,
               fn_combined_score(
                   ss.pop_score, ss.trend_score,
                   COALESCE(ppm.plays, 0)::NUMERIC / v_total_plays
               )                                         AS rec_score,
               'mood_based'::TEXT                        AS bucket
        FROM   scored_songs ss
        JOIN   song_mood      sm  ON sm.song_id  = ss.song_id
        JOIN   plays_per_mood ppm ON ppm.mood_id = sm.mood_id
        AND    ss.song_id NOT IN (SELECT b1.song_id FROM bucket1 b1)
        AND    ss.song_id NOT IN (SELECT b2.song_id FROM bucket2 b2)
        ORDER  BY ss.song_id, rec_score DESC
        LIMIT  v_bucket_limit_3
    ),
    plays_per_genre AS (
        SELECT sg.genre_id, COUNT(*) AS plays
        FROM   song_stream_history ssh
        JOIN   song_genre sg ON sg.song_id = ssh.song_id
        WHERE  ssh.listener_id = p_user_id
        GROUP BY sg.genre_id
    ),
    bucket4 AS (
        SELECT DISTINCT ON (ss.song_id)
               ss.song_id                                AS song_id,
               ss.title                                  AS title,
               fn_combined_score(
                   ss.pop_score, ss.trend_score,
                   COALESCE(ppg.plays, 0)::NUMERIC / v_total_plays
               )                                         AS rec_score,
               'genre_based'::TEXT                       AS bucket
        FROM   scored_songs ss
        JOIN   song_genre      sg  ON sg.song_id   = ss.song_id
        JOIN   plays_per_genre ppg ON ppg.genre_id = sg.genre_id
        AND    ss.song_id NOT IN (SELECT b1.song_id FROM bucket1 b1)
        AND    ss.song_id NOT IN (SELECT b2.song_id FROM bucket2 b2)
        AND    ss.song_id NOT IN (SELECT b3.song_id FROM bucket3 b3)
        ORDER  BY ss.song_id, rec_score DESC
        LIMIT  v_bucket_limit_4
    ),
    already_included AS (
        SELECT b1.song_id FROM bucket1 b1
        UNION ALL SELECT b2.song_id FROM bucket2 b2
        UNION ALL SELECT b3.song_id FROM bucket3 b3
        UNION ALL SELECT b4.song_id FROM bucket4 b4
    ),
    bucket5 AS (
        SELECT ss.song_id                                AS song_id,
               ss.title                                  AS title,
               fn_combined_score(ss.pop_score, ss.trend_score, 0) AS rec_score,
               'random_fill'::TEXT                       AS bucket
        FROM   scored_songs ss
        WHERE  ss.song_id NOT IN (SELECT ai.song_id FROM already_included ai)
        ORDER  BY RANDOM()
        LIMIT  p_limit
    )
    SELECT ar.song_id, ar.title, ar.rec_score, ar.bucket
    FROM (
        SELECT b1.song_id, b1.title, b1.rec_score, b1.bucket FROM bucket1 b1
        UNION ALL SELECT b2.song_id, b2.title, b2.rec_score, b2.bucket FROM bucket2 b2
        UNION ALL SELECT b3.song_id, b3.title, b3.rec_score, b3.bucket FROM bucket3 b3
        UNION ALL SELECT b4.song_id, b4.title, b4.rec_score, b4.bucket FROM bucket4 b4
        UNION ALL SELECT b5.song_id, b5.title, b5.rec_score, b5.bucket FROM bucket5 b5
    ) ar
    ORDER BY ar.rec_score DESC
    LIMIT p_limit;
END;
$$;


-- ============================================================
-- SECTION 4: ENRICHED WRAPPERS (SongInfo-compatible)
-- ============================================================

-- 4.1  fn_get_popular_songs
CREATE OR REPLACE FUNCTION fn_get_popular_songs(
    p_limit         INT DEFAULT 10,
    p_genre_id      INT DEFAULT NULL,
    p_mood_id       INT DEFAULT NULL,
    p_language_id   INT DEFAULT NULL,
    p_instrument_id INT DEFAULT NULL,
    p_artist_id     INT DEFAULT NULL        -- NEW
)
RETURNS TABLE (
    song_id      INT,
    title        TEXT,
    album_id     INT,
    album_title  TEXT,
    language_id  INT,
    language     TEXT,
    length       INT,
    release_date DATE,
    play_count   INT,
    owner_id     INT,
    owner_name   TEXT
)
LANGUAGE sql STABLE AS $$
    SELECT
        s.song_id,
        s.title,
        s.album_id,
        a.title         AS album_title,
        s.language_id,
        l.language_name AS language,
        s.length,
        s.release_date,
        s.play_count,
        a.owner_id,
        ar.stage_name   AS owner_name
    FROM fn_popular_songs(p_limit, p_genre_id, p_mood_id, p_language_id, p_instrument_id, p_artist_id) p
    JOIN song     s  ON s.song_id     = p.song_id
    JOIN album    a  ON a.album_id    = s.album_id
    JOIN language l  ON l.language_id = s.language_id
    JOIN artist   ar ON ar.artist_id  = a.owner_id
    ORDER BY p.popular_score DESC;
$$;


-- 4.2  fn_get_trending_songs
CREATE OR REPLACE FUNCTION fn_get_trending_songs(
    p_limit         INT DEFAULT 10,
    p_genre_id      INT DEFAULT NULL,
    p_mood_id       INT DEFAULT NULL,
    p_language_id   INT DEFAULT NULL,
    p_instrument_id INT DEFAULT NULL,
    p_artist_id     INT DEFAULT NULL        -- NEW
)
RETURNS TABLE (
    song_id      INT,
    title        TEXT,
    album_id     INT,
    album_title  TEXT,
    language_id  INT,
    language     TEXT,
    length       INT,
    release_date DATE,
    play_count   INT,
    owner_id     INT,
    owner_name   TEXT
)
LANGUAGE sql STABLE AS $$
    SELECT
        s.song_id,
        s.title,
        s.album_id,
        a.title         AS album_title,
        s.language_id,
        l.language_name AS language,
        s.length,
        s.release_date,
        s.play_count,
        a.owner_id,
        ar.stage_name   AS owner_name
    FROM fn_trending_songs(p_limit, p_genre_id, p_mood_id, p_language_id, p_instrument_id, p_artist_id) t
    JOIN song     s  ON s.song_id     = t.song_id
    JOIN album    a  ON a.album_id    = s.album_id
    JOIN language l  ON l.language_id = s.language_id
    JOIN artist   ar ON ar.artist_id  = a.owner_id
    ORDER BY t.trending_score DESC;
$$;


-- 4.3  fn_get_recommended_songs
CREATE OR REPLACE FUNCTION fn_get_recommended_songs(
    p_user_id       INT,
    p_limit         INT DEFAULT 50,
    p_genre_id      INT DEFAULT NULL,
    p_mood_id       INT DEFAULT NULL,
    p_language_id   INT DEFAULT NULL,
    p_instrument_id INT DEFAULT NULL,
    p_artist_id     INT DEFAULT NULL        -- NEW
)
RETURNS TABLE (
    song_id      INT,
    title        TEXT,
    album_id     INT,
    album_title  TEXT,
    language_id  INT,
    language     TEXT,
    length       INT,
    release_date DATE,
    play_count   INT,
    owner_id     INT,
    owner_name   TEXT
)
LANGUAGE sql STABLE AS $$
    SELECT
        s.song_id,
        s.title,
        s.album_id,
        a.title         AS album_title,
        s.language_id,
        l.language_name AS language,
        s.length,
        s.release_date,
        s.play_count,
        a.owner_id,
        ar.stage_name   AS owner_name
    FROM fn_recommended_songs(p_user_id, p_limit, p_genre_id, p_mood_id, p_language_id, p_instrument_id, p_artist_id) r
    JOIN song     s  ON s.song_id     = r.song_id
    JOIN album    a  ON a.album_id    = s.album_id
    JOIN language l  ON l.language_id = s.language_id
    JOIN artist   ar ON ar.artist_id  = a.owner_id
    ORDER BY r.rec_score DESC;
$$;


-- ============================================================
-- USAGE QUICK REFERENCE
-- ============================================================
/*
── By artist (raw) ────────────────────────────────────────────
SELECT * FROM fn_popular_songs(50, NULL, NULL, NULL, NULL, 3);
SELECT * FROM fn_trending_songs(50, NULL, NULL, NULL, NULL, 3);
SELECT * FROM fn_recommended_songs(7, 50, NULL, NULL, NULL, NULL, 3);

── By artist (enriched) ───────────────────────────────────────
SELECT * FROM fn_get_popular_songs(10, NULL, NULL, NULL, NULL, 3);
SELECT * FROM fn_get_trending_songs(10, NULL, NULL, NULL, NULL, 3);
SELECT * FROM fn_get_recommended_songs(7, 50, NULL, NULL, NULL, NULL, 3);

── Combined filters ───────────────────────────────────────────
SELECT * FROM fn_get_trending_songs(10, 2, NULL, NULL, NULL, 3); -- genre 2 + artist 3
SELECT * FROM fn_get_popular_songs(10, NULL, 1, NULL, NULL, 5);  -- mood 1 + artist 5
*/
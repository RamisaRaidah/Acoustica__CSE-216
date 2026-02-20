-- Clearing tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE
            'TRUNCATE TABLE public.' || quote_ident(r.tablename)
            || ' RESTART IDENTITY CASCADE';
    END LOOP;
END $$;

-- 1. Base tables
INSERT INTO country (country_name) VALUES ('Bangladesh');
INSERT INTO language (language_name) VALUES ('English');
INSERT INTO genre (genre_name) VALUES ('Pop');
INSERT INTO mood (mood_name) VALUES ('Happy');
INSERT INTO instrument (instrument_name) VALUES ('Guitar');
INSERT INTO asset (asset_type) VALUES ('user');
INSERT INTO asset (asset_type) VALUES ('user');
INSERT INTO asset (asset_type) VALUES ('user');
INSERT INTO asset (asset_type) VALUES ('song');
INSERT INTO asset (asset_type) VALUES ('album');
INSERT INTO asset (asset_type) VALUES ('playlist');
INSERT INTO asset (asset_type) VALUES ('product');

-- 2. Users
INSERT INTO users (asset_id, user_type, first_name, last_name, email, "password", country_id, language_id)
VALUES 
(1, 'listener', 'John', 'Doe', 'listener@example.com', 'pass123', 1, 1),
(2, 'artist', 'Alice', 'Smith', 'artist@example.com', 'pass123', 1, 1),
(3, 'admin', 'Admin', 'User', 'admin@example.com', 'pass123', 1, 1);

-- 3. Specialized roles
INSERT INTO listener (listener_id, listener_type) VALUES (1, 'free');
INSERT INTO artist (artist_id, stage_name, bank_account) VALUES (2, 'AliceStage', '123456789');
INSERT INTO admin (admin_id, role) VALUES (3, 'super_admin');

-- 4. Preferences, follows, friends
INSERT INTO language_preference (listener_id, language_id) VALUES (1, 1);
INSERT INTO followed_artist (listener_id, artist_id) VALUES (1, 2);
-- friends table requires user1_id < user2_id
INSERT INTO friend (user1_id, user2_id) VALUES (1, 2); -- minimal, same user (could skip)
INSERT INTO friend_request (sender_id, receiver_id, "status") VALUES (1, 2, 'pending');

-- 5. Albums and songs
INSERT INTO album (asset_id, title, release_date) VALUES (5, 'My Album', CURRENT_DATE);
INSERT INTO song (asset_id, title, album_id, owner_id, language_id, "length") VALUES 
(4, 'Aadat', 1, 2, 1, 180);

-- 6. Playlists
INSERT INTO playlist (asset_id, title, creator_id, "visibility") VALUES (6, 'My Playlist', 1, 'public');
INSERT INTO playlist_song (playlist_id, song_id) VALUES (1, 1);

-- 7. Song relations
INSERT INTO song_artist (song_id, artist_id, "role") VALUES (1, 2, 'vocalist');
INSERT INTO song_genre (song_id, genre_id) VALUES (1, 1);
INSERT INTO song_mood (song_id, mood_id) VALUES (1, 1);
INSERT INTO song_instrument (song_id, instrument_id) VALUES (1, 1);

-- 8. Stream history
INSERT INTO song_stream_history (listener_id, song_id, "duration") VALUES (1, 1, 120);
INSERT INTO album_stream_history (listener_id, album_id, "duration") VALUES (1, 1, 300);
INSERT INTO playlist_stream_history (listener_id, playlist_id, "duration") VALUES (1, 1, 200);

-- 9. Likes
INSERT INTO liked_song (listener_id, song_id) VALUES (1, 1);
INSERT INTO liked_album (listener_id, album_id) VALUES (1, 1);
INSERT INTO liked_playlist (listener_id, playlist_id) VALUES (1, 1);

-- 10. Transactions & plans
INSERT INTO transaction_history (user_id, transaction_type, amount, payment_method, "status") VALUES (1, 'subscription', 10.00, 'card', 'completed');
INSERT INTO plan (plan_type, plan_cost, max_members) VALUES ('individual', 10.00, 5);
INSERT INTO plan_subscription (plan_id, owner_id, start_date, end_date, transaction_id, auto_renewal_mode) VALUES (1, 1, CURRENT_DATE, CURRENT_DATE, 1, 'on');

-- 11. Family plan
INSERT INTO family_plan (family_name, parent_account_id, subscription_id) VALUES ('Doe Family', 1, 1);
INSERT INTO family_plan_member (family_plan_id, member_id) VALUES (1, 1);

-- 12. Shared content
INSERT INTO friend_shared_content (sender_id, receiver_id, content_id) VALUES (1, 1, 4);
INSERT INTO family_shared_content (family_plan_id, sender_id, content_id) VALUES (1, 1, 4);

-- 13. Product & cart
INSERT INTO product (asset_id, category, product_name, owner_id, price, stock_quantity) VALUES (7, 'ticket', 'Concert Ticket', 2, 50.00, 10);
INSERT INTO cart (owner_id, transaction_id) VALUES (1, 1);
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (1, 1, 1);

-- 14. Badges
INSERT INTO badge (badge_name, artist_id) VALUES ('Top Artist', 2);
INSERT INTO badge_user (user_id, badge_id) VALUES (1, 1);

-- 15. Approval requests, announcements, reviews, reports, logs
INSERT INTO approval_request (content_id) VALUES (4);
INSERT INTO announcement (announcer_id, text) VALUES (3, 'Welcome!');
INSERT INTO content_review (reviewer_id, topic_id, rating) VALUES (1, 4, 5);
INSERT INTO artist_review (reviewer_id, artist_id, text) VALUES (1, 2, 'Great artist');
INSERT INTO report (author_id, topic_id, text) VALUES (1, 4, 'No issues');
INSERT INTO admin_activity_log (admin_id, activity_details) VALUES (3, '{"action":"seed data"}');

-- 16. Notifications
INSERT INTO notification (notification_id, user_id, text) VALUES (1, 1, 'Welcome notification');
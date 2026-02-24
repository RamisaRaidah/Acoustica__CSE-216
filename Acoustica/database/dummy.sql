-- Inserting dummy data

INSERT INTO users (user_type, first_name, last_name, email, "password", country_id, language_id)
VALUES 
('listener', 'Shadman', 'Shanon', 'shanon@example.com', 'pass123', 1, 1),
('listener', 'Ramisa', 'Arana', 'arana@example.com', 'pass123', 1, 1),
('listener', 'Harry', 'Potter', 'harry@example.com', 'pass123', 1, 1),
('artist', 'Alice', 'Smith', 'alice@example.com', 'pass123', 1, 1),
('artist', 'Bob', 'Smith', 'bob@example.com', 'pass123', 1, 1),
('artist', 'John', 'Smith', 'john@example.com', 'pass123', 1, 1),
('admin', 'Admin', 'User', 'admin@example.com', 'pass123', 1, 1);
INSERT INTO listener (listener_id, listener_type) VALUES (1, 'free');
INSERT INTO listener (listener_id, listener_type) VALUES (2, 'free');
INSERT INTO listener (listener_id, listener_type) VALUES (3, 'free');
INSERT INTO artist (artist_id, stage_name, bank_account) VALUES (4, 'AliceStage', '123456789');
INSERT INTO artist (artist_id, stage_name, bank_account) VALUES (5, 'AliceStage', '123456789');
INSERT INTO artist (artist_id, stage_name, bank_account) VALUES (6, 'AliceStage', '123456789');
INSERT INTO admin (admin_id, role) VALUES (7, 'super_admin');
INSERT INTO language_preference (listener_id, language_id) VALUES (1, 1);
INSERT INTO followed_artist (listener_id, artist_id) VALUES (1, 4);
INSERT INTO friend (user1_id, user2_id) VALUES (1, 2); 
INSERT INTO friend_request (sender_id, receiver_id, "status") VALUES (1, 2, 'pending');
INSERT INTO album (asset_id, title, release_date, copyright_certificate) VALUES (5, 'My Album', CURRENT_DATE, 'null');
INSERT INTO song (asset_id, title, album_id, owner_id, language_id, "length") VALUES 
(4, 'Aadat', 1, 4, 1, 180);
INSERT INTO playlist (asset_id, title, creator_id, "visibility") VALUES (6, 'My Playlist', 1, 'public');
INSERT INTO playlist_song (playlist_id, song_id) VALUES (1, 1);
INSERT INTO song_artist (song_id, artist_id, "role") VALUES (1, 4, 'vocalist');
INSERT INTO song_genre (song_id, genre_id) VALUES (1, 1);
INSERT INTO song_mood (song_id, mood_id) VALUES (1, 1);
INSERT INTO song_instrument (song_id, instrument_id) VALUES (1, 1);
INSERT INTO song_stream_history (listener_id, song_id, "duration") VALUES (1, 1, 120);
INSERT INTO album_stream_history (listener_id, album_id, "duration") VALUES (1, 1, 300);
INSERT INTO playlist_stream_history (listener_id, playlist_id, "duration") VALUES (1, 1, 200);
INSERT INTO liked_song (listener_id, song_id) VALUES (1, 1);
INSERT INTO liked_album (listener_id, album_id) VALUES (1, 1);
INSERT INTO liked_playlist (listener_id, playlist_id) VALUES (1, 1);
INSERT INTO transaction_history (user_id, transaction_type, amount, payment_method, "status") VALUES (1, 'subscription', 10.00, 'card', 'completed');
INSERT INTO plan (plan_type, plan_cost, max_members) VALUES ('individual', 10.00, 5);
INSERT INTO plan_subscription (plan_id, owner_id, start_date, end_date, transaction_id, auto_renewal_mode) VALUES (1, 1, CURRENT_DATE, CURRENT_DATE, 1, 'on');
INSERT INTO family_plan (family_name, parent_account_id, subscription_id) VALUES ('Doe Family', 1, 1);
INSERT INTO family_plan_member (family_plan_id, member_id) VALUES (1, 1);
INSERT INTO friend_shared_content (sender_id, receiver_id, content_id) VALUES (1, 2, 4);
INSERT INTO family_shared_content (family_plan_id, sender_id, content_id) VALUES (1, 1, 4);
INSERT INTO product (asset_id, category, product_name, owner_id, price, stock_quantity) VALUES (7, 'ticket', 'Concert Ticket', 4, 50.00, 10);
INSERT INTO cart (owner_id, transaction_id) VALUES (1, 1);
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (1, 1, 1);
INSERT INTO badge (badge_name, artist_id) VALUES ('Top Artist', 4);
INSERT INTO badge_user (user_id, badge_id) VALUES (1, 1);
INSERT INTO approval_request (content_id) VALUES (4);
INSERT INTO announcement (announcer_id, text) VALUES (3, 'Welcome!');
INSERT INTO content_review (reviewer_id, asset_id, rating) VALUES (1, 4, 5);
INSERT INTO artist_review (reviewer_id, artist_id, text) VALUES (1, 4, 'Great artist');
INSERT INTO report (author_id, asset_id, text) VALUES (1, 4, 'No issues');
INSERT INTO admin_activity_log (admin_id, activity_details) VALUES (7, '{"action":"seed data"}');
INSERT INTO notification (notification_id, user_id, text) VALUES (1, 1, 'Welcome notification');
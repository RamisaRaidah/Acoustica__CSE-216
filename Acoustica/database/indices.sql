CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);   
CREATE INDEX idx_listener_listener_id ON listener(listener_id);
CREATE INDEX idx_artist_artist_id ON artist(artist_id);

CREATE INDEX idx_ssh_listener_datetime ON song_stream_history(listener_id, date_time DESC);
CREATE INDEX idx_ssh_song_id ON song_stream_history(song_id);

CREATE INDEX idx_followed_artist_listener ON followed_artist(listener_id);
CREATE INDEX idx_followed_artist_artist ON followed_artist(artist_id);

CREATE INDEX idx_song_album_id ON song(album_id);
CREATE INDEX idx_song_play_count ON song(play_count DESC);
CREATE INDEX idx_song_title_normalized ON song(LOWER(REPLACE(title, ' ', '')));

CREATE INDEX idx_album_owner_id ON album(owner_id);
CREATE INDEX idx_album_title_normalized ON album(LOWER(REPLACE(title, ' ', '')));
CREATE INDEX idx_album_visibility ON album(visibility);
CREATE INDEX idx_album_owner_visibility ON album(owner_id, visibility);

CREATE INDEX idx_playlist_creator_id ON playlist(creator_id);
CREATE INDEX idx_playlist_visibility_viewcount ON playlist(visibility, view_count DESC);
CREATE INDEX idx_playlist_title_creator_normalized ON playlist(creator_id, LOWER(REPLACE(title, ' ', '')));

CREATE INDEX idx_song_artist_artist_id ON song_artist(artist_id);
CREATE INDEX idx_song_genre_genre_id ON song_genre(genre_id);
CREATE INDEX idx_song_mood_mood_id ON song_mood(mood_id);
CREATE INDEX idx_song_instrument_instrument_id ON song_instrument(instrument_id);

CREATE INDEX idx_plansub_owner_active ON plan_subscription(owner_id, is_active, end_date);

CREATE INDEX idx_family_parent ON family(parent_account_id);
CREATE INDEX idx_family_member_member_id ON family_member(member_id);
CREATE INDEX idx_family_member_family_id ON family_member(family_id);

CREATE INDEX idx_liked_song_listener ON liked_song(listener_id);
CREATE INDEX idx_liked_album_listener ON liked_album(listener_id);
CREATE INDEX idx_liked_playlist_listener ON liked_playlist(listener_id);

CREATE INDEX idx_notification_user_read ON notification(user_id, is_read, date_time DESC);

CREATE INDEX idx_report_asset_id ON report(asset_id);
CREATE INDEX idx_report_datetime ON report(date_time DESC);

CREATE INDEX idx_family_shared_family_id ON family_shared_content(family_id, date_time DESC);
CREATE INDEX idx_family_shared_sender ON family_shared_content(sender_id);

CREATE INDEX idx_prt_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_prt_unused ON password_reset_tokens(token) WHERE used = FALSE;

CREATE UNIQUE INDEX unique_active_subscription ON plan_subscription(owner_id) WHERE is_active = TRUE;
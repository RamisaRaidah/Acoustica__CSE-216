CREATE TYPE user_type_enum AS ENUM ('admin', 'listener', 'artist');
CREATE TYPE listener_type_enum AS ENUM ('free', 'premium');
CREATE TYPE admin_role_enum AS ENUM ('super_admin', 'administrator', 'moderator', 'analyst', 'audit');
CREATE TYPE visibility_enum AS ENUM ('public', 'private');
CREATE TYPE song_artist_role_enum AS ENUM ('vocalist', 'lyricist', 'composer');
CREATE TYPE transaction_type_enum AS ENUM ('subscription', 'buy', 'payment', 'refund');
CREATE TYPE payment_method_enum AS ENUM ('bank', 'COD', 'card','online');
CREATE TYPE auto_renew_enum AS ENUM ('on', 'off');
CREATE TYPE app_mode_enum AS ENUM ('light', 'dark');
CREATE TYPE product_category_enum AS ENUM ('ticket','merch','cd');


CREATE TABLE IF NOT EXISTS "country" (
  country_id SERIAL CONSTRAINT pk_country PRIMARY KEY,
  country_name TEXT CONSTRAINT uq_country_country_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "language" (
  language_id SERIAL CONSTRAINT pk_language PRIMARY KEY,
  language_name TEXT CONSTRAINT uq_language_language_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "genre" (
  genre_id SERIAL CONSTRAINT pk_genre PRIMARY KEY,
  genre_name TEXT CONSTRAINT uq_genre_genre_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "mood" (
  mood_id SERIAL CONSTRAINT pk_mood PRIMARY KEY,
  mood_name TEXT CONSTRAINT uq_mood_mood_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "instrument" (
  instrument_id SERIAL CONSTRAINT pk_instrument PRIMARY KEY,
  instrument_name TEXT CONSTRAINT uq_instrument_instrument_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset" (
  asset_id SERIAL CONSTRAINT pk_asset PRIMARY KEY,
  asset_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  user_id SERIAL CONSTRAINT pk_users PRIMARY KEY,
  asset_id INT CONSTRAINT fk_users_asset_asset_id REFERENCES asset(asset_id),
  user_type user_type_enum NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT CONSTRAINT uq_users_email UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  profile_picture TEXT,
  bio TEXT,
  country_id INT CONSTRAINT fk_users_country_country_id REFERENCES country(country_id),
  language_id INT CONSTRAINT fk_users_language_language_id REFERENCES language(language_id),
  phone_number TEXT,
  gender TEXT,
  date_of_birth DATE,
  app_mode app_mode_enum DEFAULT 'light'
);


CREATE TABLE IF NOT EXISTS "listener" (
  listener_id INT CONSTRAINT pk_listener PRIMARY KEY CONSTRAINT fk_listener_users_user_id REFERENCES "users"(user_id),
  listener_type listener_type_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "artist" (
  artist_id INT CONSTRAINT pk_artist PRIMARY KEY CONSTRAINT fk_artist_users_user_id REFERENCES "users"(user_id),
  stage_name TEXT,
  bank_account TEXT,
  points INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "admin" (
  admin_id INT CONSTRAINT pk_admin PRIMARY KEY CONSTRAINT fk_admin_users_user_id REFERENCES "users"(user_id),
  role admin_role_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "language_preference" (
  listener_id INT CONSTRAINT fk_language_preference_listener_listener_id REFERENCES listener(listener_id),
  language_id INT CONSTRAINT fk_language_preference_language_language_id REFERENCES language(language_id),
  CONSTRAINT pk_language_preference PRIMARY KEY (listener_id, language_id)
);

CREATE TABLE IF NOT EXISTS "followed_artist" (
  listener_id INT CONSTRAINT fk_followed_artist_listener_listener_id REFERENCES listener(listener_id),
  artist_id INT CONSTRAINT fk_followed_artist_artist_artist_id REFERENCES artist(artist_id),
  CONSTRAINT pk_followed_artist PRIMARY KEY (listener_id, artist_id)
);

CREATE TABLE IF NOT EXISTS "friend" (
  user1_id INT CONSTRAINT fk_friend_listener_user1 REFERENCES listener(listener_id),
  user2_id INT CONSTRAINT fk_friend_listener_user2 REFERENCES listener(listener_id),
  CONSTRAINT pk_friend PRIMARY KEY (user1_id, user2_id),
  CONSTRAINT ck_friend_user1_lt_user2 CHECK (user1_id < user2_id)
);

CREATE TABLE IF NOT EXISTS "friend_request" (
  sender_id INT CONSTRAINT fk_friend_request_listener_sender_id REFERENCES listener(listener_id),
  receiver_id INT CONSTRAINT fk_friend_request_listener_receiver_id REFERENCES listener(listener_id),
  "status" TEXT CONSTRAINT ck_friend_request_status CHECK (status IN ('accepted', 'pending', 'rejected')),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_friend_request PRIMARY KEY (sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS "album" (
  album_id SERIAL CONSTRAINT pk_album PRIMARY KEY,
  asset_id INT CONSTRAINT fk_album_asset_asset_id REFERENCES asset(asset_id),
  "title" TEXT NOT NULL,
  "description" TEXT,
  release_date DATE,
  cover_picture TEXT,
  copyright_certificate TEXT
);

CREATE TABLE IF NOT EXISTS "song" (
  song_id SERIAL CONSTRAINT pk_song PRIMARY KEY,
  asset_id INT CONSTRAINT fk_song_asset_asset_id REFERENCES asset(asset_id),
  "title" TEXT NOT NULL,
  album_id INT CONSTRAINT fk_song_album_album_id REFERENCES album(album_id),
  owner_id INT CONSTRAINT fk_song_artist_owner_id REFERENCES artist(artist_id),
  language_id INT CONSTRAINT fk_song_language_language_id REFERENCES language(language_id),
  "length" INT,
  release_date DATE,
  song_audio TEXT,
  lyrics TEXT,
  copyright_certificate TEXT
);

CREATE TABLE IF NOT EXISTS "playlist" (
  playlist_id SERIAL CONSTRAINT pk_playlist PRIMARY KEY,
  asset_id INT CONSTRAINT fk_playlist_asset_asset_id REFERENCES asset(asset_id),
  "title" TEXT NOT NULL,
  creator_id INT CONSTRAINT fk_playlist_listener_creator_id REFERENCES listener(listener_id),
  "description" TEXT,
  creation_date DATE DEFAULT CURRENT_DATE,
  "visibility" visibility_enum,
  cover_picture TEXT
);

CREATE TABLE IF NOT EXISTS "playlist_song" (
  playlist_id INT CONSTRAINT fk_playlist_song_playlist_playlist_id REFERENCES playlist(playlist_id),
  song_id INT CONSTRAINT fk_playlist_song_song_song_id REFERENCES song(song_id),
  CONSTRAINT pk_playlist_song PRIMARY KEY (playlist_id, song_id)
);

CREATE TABLE IF NOT EXISTS "song_artist" (
  song_id INT CONSTRAINT fk_song_artist_song_song_id REFERENCES song(song_id),
  artist_id INT CONSTRAINT fk_song_artist_artist_artist_id REFERENCES artist(artist_id),
  "role" song_artist_role_enum,
  CONSTRAINT pk_song_artist PRIMARY KEY (song_id, artist_id)
);

CREATE TABLE IF NOT EXISTS "song_genre" (
  song_id INT CONSTRAINT fk_song_genre_song_song_id REFERENCES song(song_id),
  genre_id INT CONSTRAINT fk_song_genre_genre_genre_id REFERENCES genre(genre_id),
  CONSTRAINT pk_song_genre PRIMARY KEY (song_id, genre_id)
);

CREATE TABLE IF NOT EXISTS "song_mood" (
  song_id INT CONSTRAINT fk_song_mood_song_song_id REFERENCES song(song_id),
  mood_id INT CONSTRAINT fk_song_mood_mood_mood_id REFERENCES mood(mood_id),
  CONSTRAINT pk_song_mood PRIMARY KEY (song_id, mood_id)
);

CREATE TABLE IF NOT EXISTS "song_instrument" (
  song_id INT CONSTRAINT fk_song_instrument_song_song_id REFERENCES song(song_id),
  instrument_id INT CONSTRAINT fk_song_instrument_instrument_instrument_id REFERENCES instrument(instrument_id),
  CONSTRAINT pk_song_instrument PRIMARY KEY (song_id, instrument_id)
);

CREATE TABLE IF NOT EXISTS "song_stream_history" (
  song_stream_id SERIAL CONSTRAINT pk_song_stream_history PRIMARY KEY,
  listener_id INT CONSTRAINT fk_song_stream_history_listener_listener_id REFERENCES listener(listener_id),
  song_id INT CONSTRAINT fk_song_stream_history_song_song_id REFERENCES song(song_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "duration" INT
);

CREATE TABLE IF NOT EXISTS "album_stream_history" (
  album_stream_id SERIAL CONSTRAINT pk_album_stream_history PRIMARY KEY,
  listener_id INT CONSTRAINT fk_album_stream_history_listener_listener_id REFERENCES listener(listener_id),
  album_id INT CONSTRAINT fk_album_stream_history_album_album_id REFERENCES album(album_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "duration" INT
);

CREATE TABLE IF NOT EXISTS "playlist_stream_history" (
  playlist_stream_id SERIAL CONSTRAINT pk_playlist_stream_history PRIMARY KEY,
  listener_id INT CONSTRAINT fk_playlist_stream_history_listener_listener_id REFERENCES listener(listener_id),
  playlist_id INT CONSTRAINT fk_playlist_stream_history_playlist_playlist_id REFERENCES playlist(playlist_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "duration" INT
);

CREATE TABLE IF NOT EXISTS "liked_song" (
  listener_id INT CONSTRAINT fk_liked_song_listener_listener_id REFERENCES listener(listener_id),
  song_id INT CONSTRAINT fk_liked_song_song_song_id REFERENCES song(song_id),
  CONSTRAINT pk_liked_song PRIMARY KEY (listener_id, song_id)
);

CREATE TABLE IF NOT EXISTS "liked_album" (
  listener_id INT CONSTRAINT fk_liked_album_listener_listener_id REFERENCES listener(listener_id),
  album_id INT CONSTRAINT fk_liked_album_album_album_id REFERENCES album(album_id),
  CONSTRAINT pk_liked_album PRIMARY KEY (listener_id, album_id)
);

CREATE TABLE IF NOT EXISTS "liked_playlist" (
  listener_id INT CONSTRAINT fk_liked_playlist_listener_listener_id REFERENCES listener(listener_id),
  playlist_id INT CONSTRAINT fk_liked_playlist_playlist_playlist_id REFERENCES playlist(playlist_id),
  CONSTRAINT pk_liked_playlist PRIMARY KEY (listener_id, playlist_id)
);


CREATE TABLE IF NOT EXISTS "transaction_history" (
  transaction_id SERIAL CONSTRAINT transaction_history_pkey PRIMARY KEY,
  user_id INT CONSTRAINT transaction_history_user_fkey REFERENCES "users"(user_id),
  transaction_type transaction_type_enum CONSTRAINT transaction_history_type_check,
  amount NUMERIC(10,2) CONSTRAINT transaction_history_amount_check,
  payment_method payment_method_enum CONSTRAINT transaction_history_payment_check,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT
);

CREATE TABLE IF NOT EXISTS "plan" (
  plan_id SERIAL CONSTRAINT plan_pkey PRIMARY KEY,
  plan_type TEXT,
  plan_cost NUMERIC(10,2) CONSTRAINT plan_cost_check,
  max_members INT CONSTRAINT plan_max_members_check
);

CREATE TABLE IF NOT EXISTS "plan_subscription" (
  subscription_id SERIAL CONSTRAINT plan_subscription_pkey PRIMARY KEY,
  plan_id INT CONSTRAINT plan_subscription_plan_fkey REFERENCES plan(plan_id),
  owner_id INT CONSTRAINT plan_subscription_owner_fkey REFERENCES listener(listener_id),
  start_date DATE,
  end_date DATE,
  transaction_id INT CONSTRAINT plan_subscription_transaction_fkey REFERENCES transaction_history(transaction_id),
  auto_renewal_mode auto_renew_enum
);

CREATE TABLE IF NOT EXISTS "family_plan" (
  family_plan_id SERIAL CONSTRAINT family_plan_pkey PRIMARY KEY,
  family_name TEXT,
  parent_account_id INT CONSTRAINT family_plan_parent_fkey REFERENCES listener(listener_id),
  subscription_id INT CONSTRAINT family_plan_subscription_fkey REFERENCES plan_subscription(subscription_id)
);

CREATE TABLE IF NOT EXISTS "family_plan_member" (
  family_plan_id INT CONSTRAINT family_plan_member_family_fkey REFERENCES family_plan(family_plan_id),
  member_id INT CONSTRAINT family_plan_member_member_fkey REFERENCES listener(listener_id),
  CONSTRAINT family_plan_member_pkey PRIMARY KEY (family_plan_id, member_id)
);

CREATE TABLE IF NOT EXISTS "friend_shared_content" (
  friend_shared_id SERIAL CONSTRAINT friend_shared_content_pkey PRIMARY KEY,
  sender_id INT CONSTRAINT friend_shared_content_sender_fkey REFERENCES listener(listener_id),
  receiver_id INT CONSTRAINT friend_shared_content_receiver_fkey REFERENCES listener(listener_id),
  content_id INT CONSTRAINT friend_shared_content_content_fkey REFERENCES asset(asset_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "family_shared_content" (
  family_shared_id SERIAL CONSTRAINT family_shared_content_pkey PRIMARY KEY,
  family_plan_id INT CONSTRAINT family_shared_content_family_fkey REFERENCES family_plan(family_plan_id),
  sender_id INT CONSTRAINT family_shared_content_sender_fkey REFERENCES listener(listener_id),
  content_id INT CONSTRAINT family_shared_content_content_fkey REFERENCES asset(asset_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "product" (
  product_id SERIAL CONSTRAINT product_pkey PRIMARY KEY,
  asset_id INT CONSTRAINT product_asset_fkey UNIQUE REFERENCES asset(asset_id),
  category product_category_enum CONSTRAINT product_category_check,
  product_name TEXT,
  owner_id INT CONSTRAINT product_owner_fkey REFERENCES artist(artist_id),
  "description" TEXT,
  product_image TEXT,
  price NUMERIC(10,2) CONSTRAINT product_price_check CHECK (price >= 0),
  stock_quantity INT CONSTRAINT product_stock_check CHECK (stock_quantity >= 0),
  expiration_date DATE
);

CREATE TABLE IF NOT EXISTS "cart" (
  cart_id SERIAL CONSTRAINT cart_pkey PRIMARY KEY,
  owner_id INT CONSTRAINT cart_owner_fkey REFERENCES listener(listener_id),
  transaction_id INT CONSTRAINT cart_transaction_fkey UNIQUE REFERENCES transaction_history(transaction_id)
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  cart_id INT CONSTRAINT cart_items_cart_fkey REFERENCES cart(cart_id),
  product_id INT CONSTRAINT cart_items_product_fkey REFERENCES "product"(product_id),
  quantity INT CONSTRAINT cart_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT cart_items_pkey PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS "badge" (
  badge_id SERIAL CONSTRAINT badge_pkey PRIMARY KEY,
  badge_name TEXT,
  "description" TEXT,
  image TEXT,
  artist_id INT CONSTRAINT badge_artist_fkey REFERENCES artist(artist_id)
);

CREATE TABLE IF NOT EXISTS "badge_user" (
  user_id INT CONSTRAINT badge_user_user_fkey REFERENCES "users"(user_id),
  badge_id INT CONSTRAINT badge_user_badge_fkey REFERENCES badge(badge_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT badge_user_pkey PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS "approval_request" (
  request_id SERIAL CONSTRAINT approval_request_pkey PRIMARY KEY,
  content_id INT CONSTRAINT approval_request_content_fkey REFERENCES asset(asset_id)
);

CREATE TABLE IF NOT EXISTS "announcement" (
  announcement_id SERIAL CONSTRAINT announcement_pkey PRIMARY KEY,
  announcer_id INT CONSTRAINT announcement_user_fkey REFERENCES "users"(user_id),
  text TEXT,
  image TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "content_review" (
  review_id SERIAL CONSTRAINT content_review_pkey PRIMARY KEY,
  reviewer_id INT CONSTRAINT content_review_reviewer_fkey REFERENCES listener(listener_id),
  topic_id INT CONSTRAINT content_review_topic_fkey REFERENCES asset(asset_id),
  text TEXT,
  rating INT CONSTRAINT content_review_rating_check CHECK (rating BETWEEN 0 AND 5),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "artist_review" (
  review_id SERIAL CONSTRAINT artist_review_pkey PRIMARY KEY,
  reviewer_id INT CONSTRAINT artist_review_reviewer_fkey REFERENCES listener(listener_id),
  artist_id INT CONSTRAINT artist_review_artist_fkey REFERENCES artist(artist_id),
  text TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "report" (
  report_id SERIAL CONSTRAINT report_pkey PRIMARY KEY,
  author_id INT CONSTRAINT report_author_fkey REFERENCES "users"(user_id),
  topic_id INT CONSTRAINT report_topic_fkey REFERENCES asset(asset_id),
  text TEXT,
  image TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "admin_activity_log" (
  activity_id SERIAL CONSTRAINT admin_activity_log_pkey PRIMARY KEY,
  admin_id INT CONSTRAINT admin_activity_log_admin_fkey REFERENCES admin(admin_id),
  activity_details TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
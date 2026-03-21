-- Clearing database
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    FOR r IN
        SELECT n.nspname AS enum_schema,
               t.typname AS enum_name
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        GROUP BY n.nspname, t.typname
        HAVING n.nspname = 'public'
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.enum_name) || ' CASCADE';
    END LOOP;
END $$;

-- Creating enums 

CREATE TYPE user_type_enum AS ENUM ('admin', 'listener', 'artist');
CREATE TYPE listener_type_enum AS ENUM ('free', 'premium');
CREATE TYPE admin_role_enum AS ENUM ('super_admin', 'administrator', 'moderator', 'analyst', 'audit');
CREATE TYPE visibility_enum AS ENUM ('public', 'private', 'pending');
CREATE TYPE song_artist_role_enum AS ENUM ('vocalist', 'lyricist', 'composer');
CREATE TYPE transaction_type_enum AS ENUM ('subscription', 'buy', 'payment', 'refund');
CREATE TYPE payment_method_enum AS ENUM ('bank', 'COD', 'card', 'online');
CREATE TYPE auto_renew_enum AS ENUM ('on', 'off');
CREATE TYPE theme_enum AS ENUM ('light', 'dark');
CREATE TYPE product_category_enum AS ENUM ('ticket','merch','cd');
CREATE TYPE asset_type_enum AS ENUM ('user','song','playlist','album','product','report');


-- Creating tables

CREATE TABLE IF NOT EXISTS "country" (
  country_id SERIAL CONSTRAINT pk_country PRIMARY KEY,
  country_name TEXT CONSTRAINT uq_country_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "language" (
  language_id SERIAL CONSTRAINT pk_language PRIMARY KEY,
  language_name TEXT CONSTRAINT uq_language_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "genre" (
  genre_id SERIAL CONSTRAINT pk_genre PRIMARY KEY,
  genre_name TEXT CONSTRAINT uq_genre_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "mood" (
  mood_id SERIAL CONSTRAINT pk_mood PRIMARY KEY,
  mood_name TEXT CONSTRAINT uq_mood_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "instrument" (
  instrument_id SERIAL CONSTRAINT pk_instrument PRIMARY KEY,
  instrument_name TEXT CONSTRAINT uq_instrument_name UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset" (
  asset_id SERIAL CONSTRAINT pk_asset PRIMARY KEY,
  asset_type asset_type_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  user_id SERIAL CONSTRAINT pk_users PRIMARY KEY,
  asset_id INT CONSTRAINT fk_users_asset_id REFERENCES asset(asset_id) ON DELETE CASCADE,
  user_type user_type_enum NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT CONSTRAINT uq_users_email UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  profile_picture TEXT,
  bio TEXT,
  country_id INT CONSTRAINT fk_users_country_id REFERENCES country(country_id),
  language_id INT CONSTRAINT fk_users_language_id REFERENCES "language"(language_id),
  phone_number TEXT,
  gender TEXT,
  date_of_birth DATE,
  theme theme_enum DEFAULT 'light',
  onboarding_done BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "listener" (
  listener_id INT CONSTRAINT pk_listener PRIMARY KEY REFERENCES "users"(user_id) ON DELETE CASCADE,
  listener_type listener_type_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "artist" (
  artist_id INT CONSTRAINT pk_artist PRIMARY KEY REFERENCES "users"(user_id) ON DELETE CASCADE,
  stage_name TEXT,
  bank_account TEXT,
  points INT DEFAULT 0,
  is_Band BOOLEAN
);

CREATE TABLE IF NOT EXISTS "admin" (
  admin_id INT CONSTRAINT pk_admin PRIMARY KEY REFERENCES "users"(user_id) ON DELETE CASCADE,
  role admin_role_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "language_preference" (
  listener_id INT CONSTRAINT fk_language_preference_listener_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  language_id INT CONSTRAINT fk_language_preference_language_id REFERENCES "language"(language_id),
  CONSTRAINT pk_language_preference PRIMARY KEY (listener_id, language_id)
);

CREATE TABLE IF NOT EXISTS "followed_artist" (
  listener_id INT CONSTRAINT fk_followed_artist_listener_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  artist_id INT CONSTRAINT fk_followed_artist_artist_id REFERENCES artist(artist_id) ON DELETE CASCADE,
  CONSTRAINT pk_followed_artist PRIMARY KEY (listener_id, artist_id)
);

CREATE TABLE IF NOT EXISTS "friend" (
  user1_id INT CONSTRAINT fk_friend_listener_user1 REFERENCES listener(listener_id) ON DELETE CASCADE,
  user2_id INT CONSTRAINT fk_friend_listener_user2 REFERENCES listener(listener_id) ON DELETE CASCADE,
  CONSTRAINT pk_friend PRIMARY KEY (user1_id, user2_id),
  CONSTRAINT ck_friend_user1_lt_user2 CHECK (user1_id<user2_id)
);

CREATE TABLE IF NOT EXISTS "friend_request" (
  sender_id INT CONSTRAINT fk_friend_request_listener_sender_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  receiver_id INT CONSTRAINT fk_friend_request_listener_receiver_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  "status" TEXT CHECK ("status" IN ('accepted', 'pending', 'rejected')),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_friend_request PRIMARY KEY (sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS "album" (
  album_id SERIAL CONSTRAINT pk_album PRIMARY KEY,
  asset_id INT CONSTRAINT fk_album_asset_id  REFERENCES asset(asset_id) ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  owner_id INT CONSTRAINT fk_song_artist_owner_id REFERENCES artist(artist_id) ON DELETE CASCADE,
  release_date DATE NOT NULL,
  cover_picture TEXT,
  "visibility" visibility_enum,
  copyright_certificate TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "song" (
  song_id SERIAL CONSTRAINT pk_song PRIMARY KEY,
  asset_id INT CONSTRAINT fk_song_asset_id REFERENCES asset(asset_id) ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  album_id INT CONSTRAINT fk_song_album_id REFERENCES album(album_id) ON DELETE CASCADE,
  language_id INT CONSTRAINT fk_song_language_id REFERENCES "language"(language_id),
  "length" INT,
  release_date DATE,
  song_audio TEXT,
  lyrics TEXT,
  "visibility" visibility_enum,
  copyright_certificate TEXT,
  play_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "playlist" (
  playlist_id SERIAL CONSTRAINT pk_playlist PRIMARY KEY,
  asset_id INT CONSTRAINT fk_playlist_asset_id REFERENCES asset(asset_id) ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  creator_id INT CONSTRAINT fk_playlist_listener_creator_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  "description" TEXT,
  creation_date DATE DEFAULT CURRENT_DATE,
  cover_picture TEXT,
  "visibility" visibility_enum,
  view_count INT  DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "playlist_song" (
  playlist_id INT CONSTRAINT fk_playlist_song_playlist_id REFERENCES playlist(playlist_id) ON DELETE CASCADE,
  song_id INT CONSTRAINT fk_playlist_song_song_id REFERENCES song(song_id) ON DELETE CASCADE,
  CONSTRAINT pk_playlist_song PRIMARY KEY (playlist_id, song_id)
);

CREATE TABLE IF NOT EXISTS "song_artist" (
  song_id INT CONSTRAINT fk_song_artist_song_id REFERENCES song(song_id) ON DELETE CASCADE,
  artist_id INT CONSTRAINT fk_song_artist_artist_id REFERENCES artist(artist_id) ON DELETE CASCADE,
  "role" song_artist_role_enum,
  CONSTRAINT pk_song_artist PRIMARY KEY (song_id, artist_id, role)
);

CREATE TABLE IF NOT EXISTS "song_genre" (
  song_id INT CONSTRAINT fk_song_genre_song_id REFERENCES song(song_id) ON DELETE CASCADE,
  genre_id INT CONSTRAINT fk_song_genre_genre_id REFERENCES genre(genre_id),
  CONSTRAINT pk_song_genre PRIMARY KEY (song_id, genre_id)
);

CREATE TABLE IF NOT EXISTS "song_mood" (
  song_id INT CONSTRAINT fk_song_mood_song_id REFERENCES song(song_id) ON DELETE CASCADE,
  mood_id INT CONSTRAINT fk_song_mood_mood_id REFERENCES mood(mood_id),
  CONSTRAINT pk_song_mood PRIMARY KEY (song_id, mood_id)
);

CREATE TABLE IF NOT EXISTS "song_instrument" (
  song_id INT CONSTRAINT fk_song_instrument_song_id REFERENCES song(song_id) ON DELETE CASCADE,
  instrument_id INT CONSTRAINT fk_song_instrument_instrument_id REFERENCES instrument(instrument_id),
  CONSTRAINT pk_song_instrument PRIMARY KEY (song_id, instrument_id)
);

CREATE TABLE IF NOT EXISTS "song_stream_history" (
  song_stream_id SERIAL CONSTRAINT pk_song_stream_history PRIMARY KEY,
  listener_id INT CONSTRAINT fk_song_stream_history_listener_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  song_id INT CONSTRAINT fk_song_stream_history_song_id REFERENCES song(song_id) ON DELETE CASCADE,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "duration" INT,
  progress NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS "liked_song" (
  listener_id INT CONSTRAINT fk_liked_song_listener_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  song_id INT CONSTRAINT fk_liked_song_song_id REFERENCES song(song_id) ON DELETE CASCADE,
  CONSTRAINT pk_liked_song PRIMARY KEY (listener_id, song_id)
);

CREATE TABLE IF NOT EXISTS "liked_album" (
  listener_id INT CONSTRAINT fk_liked_album_listener_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  album_id INT CONSTRAINT fk_liked_album_album_id REFERENCES album(album_id) ON DELETE CASCADE,
  CONSTRAINT pk_liked_album PRIMARY KEY (listener_id, album_id)
);

CREATE TABLE IF NOT EXISTS "liked_playlist" (
  listener_id INT CONSTRAINT fk_liked_playlist_listener_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  playlist_id INT CONSTRAINT fk_liked_playlist_playlist_id REFERENCES playlist(playlist_id) ON DELETE CASCADE,
  CONSTRAINT pk_liked_playlist PRIMARY KEY (listener_id, playlist_id)
);

CREATE TABLE IF NOT EXISTS "transaction_history" (
  transaction_id SERIAL CONSTRAINT pk_transaction_history PRIMARY KEY,
  user_id INT CONSTRAINT fk_transaction_history_user_id REFERENCES "users"(user_id) ON DELETE CASCADE,
  transaction_type transaction_type_enum,
  amount NUMERIC(10,2),
  payment_method payment_method_enum,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT
);

CREATE TABLE IF NOT EXISTS "plan" (
  plan_id SERIAL CONSTRAINT pk_plan PRIMARY KEY,
  plan_type TEXT,
  plan_cost NUMERIC(10,2),
  plan_validity INT NOT NULL,
  max_members INT
);

CREATE TABLE IF NOT EXISTS "plan_subscription" (
  subscription_id SERIAL CONSTRAINT pk_plan_subscription PRIMARY KEY,
  plan_id INT CONSTRAINT fk_plan_subscription_plan_id REFERENCES plan(plan_id) ON DELETE CASCADE,
  owner_id INT CONSTRAINT fk_plan_subscription_listener_owner_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  transaction_id INT CONSTRAINT fk_plan_subscription_transaction_id REFERENCES transaction_history(transaction_id) ON DELETE CASCADE,
  auto_renewal_mode auto_renew_enum,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "family" (
  family_id SERIAL CONSTRAINT pk_family PRIMARY KEY,
  family_name TEXT,
  parent_account_id INT CONSTRAINT fk_family_listener_parent_account_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  subscription_id INT CONSTRAINT fk_family_subscription_id REFERENCES plan_subscription(subscription_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "family_member" (
  family_id INT CONSTRAINT fk_family_member_family_id REFERENCES family(family_id) ON DELETE CASCADE,
  member_id INT CONSTRAINT fk_family_member_listener_member_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  CONSTRAINT pk_family_member PRIMARY KEY (family_id, member_id)
);

CREATE TABLE IF NOT EXISTS "friend_shared_content" (
  friend_shared_id SERIAL CONSTRAINT pk_friend_shared_content PRIMARY KEY,
  sender_id INT CONSTRAINT fk_friend_shared_content_listener_sender_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  receiver_id INT CONSTRAINT fk_friend_shared_content_listener_receiver_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  content_id INT CONSTRAINT fk_friend_shared_content_asset_content_id REFERENCES asset(asset_id) ON DELETE CASCADE,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "family_shared_content" (
  family_shared_id SERIAL CONSTRAINT pk_family_shared_content PRIMARY KEY,
  family_id INT CONSTRAINT fk_family_shared_content_family_family_id REFERENCES family(family_id) ON DELETE CASCADE,
  sender_id INT CONSTRAINT fk_family_shared_content_listener_sender_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  content_id INT CONSTRAINT fk_family_shared_content_asset_content_id REFERENCES asset(asset_id) ON DELETE CASCADE,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "product" (
  product_id SERIAL CONSTRAINT pk_product PRIMARY KEY,
  asset_id INT CONSTRAINT uq_product_asset_id UNIQUE,
  category product_category_enum,
  product_name TEXT,
  owner_id INT CONSTRAINT fk_product_artist_owner_id REFERENCES artist(artist_id) ON DELETE CASCADE,
  "description" TEXT,
  product_image TEXT,
  price NUMERIC(10,2) CONSTRAINT ck_product_price_nonnegative CHECK (price >= 0),
  stock_quantity INT CONSTRAINT ck_product_stock_nonnegative CHECK (stock_quantity >= 0),
  expiration_date DATE,
  CONSTRAINT fk_product_asset_id FOREIGN KEY (asset_id) REFERENCES asset(asset_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "cart" (
  cart_id SERIAL CONSTRAINT pk_cart PRIMARY KEY,
  owner_id INT CONSTRAINT fk_cart_listener_owner_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  transaction_id INT CONSTRAINT uq_cart_transaction_id UNIQUE,
  CONSTRAINT fk_cart_transaction_id FOREIGN KEY (transaction_id) REFERENCES transaction_history(transaction_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  cart_id INT CONSTRAINT fk_cart_items_cart_id REFERENCES cart(cart_id) ON DELETE CASCADE,
  product_id INT CONSTRAINT fk_cart_items_product_id REFERENCES product(product_id) ON DELETE CASCADE,
  quantity INT CONSTRAINT ck_cart_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT pk_cart_items PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS "badge" (
  badge_id SERIAL CONSTRAINT pk_badge PRIMARY KEY,
  badge_name TEXT,
  "description" TEXT,
  image TEXT,
  artist_id INT CONSTRAINT fk_badge_artist_id REFERENCES artist(artist_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "badge_user" (
  user_id INT CONSTRAINT fk_badge_user_user_id REFERENCES "users"(user_id) ON DELETE CASCADE,
  badge_id INT CONSTRAINT fk_badge_user_badge_id REFERENCES badge(badge_id) ON DELETE CASCADE,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_badge_user PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS "approval_request" (
  request_id SERIAL CONSTRAINT pk_approval_request PRIMARY KEY,
  content_id INT CONSTRAINT fk_approval_request_asset_content_id REFERENCES asset(asset_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "announcement" (
  announcement_id SERIAL CONSTRAINT pk_announcement PRIMARY KEY,
  announcer_id INT CONSTRAINT fk_announcement_users_announcer_id REFERENCES "users"(user_id) ON DELETE CASCADE,
  text TEXT,
  image TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "content_review" (
  review_id SERIAL CONSTRAINT pk_content_review PRIMARY KEY,
  reviewer_id INT CONSTRAINT fk_content_review_listener_reviewer_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  asset_id INT CONSTRAINT fk_content_review_asset_topic_id REFERENCES asset(asset_id) ON DELETE CASCADE,
  text TEXT,
  rating INT CONSTRAINT ck_content_review_rating_range CHECK (rating BETWEEN 0 AND 5),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "artist_review" (
  review_id SERIAL CONSTRAINT pk_artist_review PRIMARY KEY,
  reviewer_id INT CONSTRAINT fk_artist_review_listener_reviewer_id REFERENCES listener(listener_id) ON DELETE CASCADE,
  artist_id INT CONSTRAINT fk_artist_review_artist_artist_id REFERENCES artist(artist_id) ON DELETE CASCADE,
  text TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "report" (
  report_id SERIAL CONSTRAINT pk_report PRIMARY KEY,
  author_id INT CONSTRAINT fk_report_users_author_id REFERENCES "users"(user_id) ON DELETE CASCADE,
  asset_id INT CONSTRAINT fk_report_asset_topic_id REFERENCES asset(asset_id) ON DELETE CASCADE,
  text TEXT,
  image TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "admin_activity_log" (
  activity_id SERIAL CONSTRAINT pk_admin_activity_log PRIMARY KEY,
  admin_id INT CONSTRAINT fk_admin_activity_log_admin_admin_id REFERENCES admin(admin_id) ON DELETE CASCADE,
  activity_details JSONB,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "notification" (
  notification_id SERIAL CONSTRAINT pk_notification PRIMARY KEY,
  user_id INT CONSTRAINT fk_notification_user_id REFERENCES "users"(user_id) ON DELETE CASCADE,
  text TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);



CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);   
CREATE INDEX idx_listener_listener_id ON listener(listener_id);
CREATE INDEX idx_artist_artist_id ON artist(artist_id);
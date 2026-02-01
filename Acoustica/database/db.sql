CREATE TYPE user_type_enum AS ENUM ('admin', 'listener', 'artist');
CREATE TYPE listener_type_enum AS ENUM ('free', 'premium');
CREATE TYPE admin_role_enum AS ENUM ('super_admin', 'administrator', 'moderator', 'analyst', 'audit');
CREATE TYPE visibility_enum AS ENUM ('public', 'private');
CREATE TYPE song_artist_role_enum AS ENUM ('vocalist', 'lyricist', 'composer');
CREATE TYPE transaction_type_enum AS ENUM ('subscription', 'buy', 'payment', 'refund');
CREATE TYPE payment_method_enum AS ENUM ('bank', 'COD', 'card', 'online');
CREATE TYPE auto_renew_enum AS ENUM ('on', 'off');
CREATE TYPE app_mode_enum AS ENUM ('light', 'dark');
CREATE TYPE product_category_enum AS ENUM ('ticket','merch','cd');


CREATE TABLE IF NOT EXISTS "country" (
  country_id SERIAL PRIMARY KEY,
  country_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "language" (
  language_id SERIAL PRIMARY KEY,
  language_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "genre" (
  genre_id SERIAL PRIMARY KEY,
  genre_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "mood" (
  mood_id SERIAL PRIMARY KEY,
  mood_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "instrument" (
  instrument_id SERIAL PRIMARY KEY,
  instrument_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset" (
  asset_id SERIAL PRIMARY KEY,
  asset_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  user_id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES asset(asset_id),
  user_type user_type_enum NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  profile_picture TEXT,
  bio TEXT,
  country_id INT REFERENCES country(country_id),
  language_id INT REFERENCES language(language_id),
  phone_number TEXT,
  gender TEXT,
  date_of_birth DATE,
  app_mode app_mode_enum DEFAULT 'light'
);

CREATE TABLE IF NOT EXISTS "listener" (
  listener_id INT PRIMARY KEY REFERENCES "users"(user_id),
  listener_type listener_type_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "artist" (
  artist_id INT PRIMARY KEY REFERENCES "users"(user_id),
  stage_name TEXT,
  bank_account TEXT,
  points INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "admin" (
  admin_id INT PRIMARY KEY REFERENCES "users"(user_id),
  role admin_role_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS "language_preference" (
  listener_id INT REFERENCES listener(listener_id),
  language_id INT REFERENCES language(language_id),
  PRIMARY KEY (listener_id, language_id)
);

CREATE TABLE IF NOT EXISTS "followed_artist" (
  listener_id INT REFERENCES listener(listener_id),
  artist_id INT REFERENCES artist(artist_id),
  PRIMARY KEY (listener_id, artist_id)
);

CREATE TABLE IF NOT EXISTS "friend" (
  user1_id INT REFERENCES listener(listener_id),
  user2_id INT REFERENCES listener(listener_id),
  PRIMARY KEY (user1_id, user2_id),
  CHECK (user1_id<user2_id)
);

CREATE TABLE IF NOT EXISTS "friend_request" (
  sender_id INT REFERENCES listener(listener_id),
  receiver_id INT REFERENCES listener(listener_id),
  "status" TEXT CHECK (status IN ('accepted', 'pending', 'rejected')),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS "album" (
  album_id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES asset(asset_id),
  "title" TEXT NOT NULL,
  "description" TEXT,
  release_date DATE,
  cover_picture TEXT,
  copyright_certificate TEXT
);

CREATE TABLE IF NOT EXISTS "song" (
  song_id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES asset(asset_id),
  "title" TEXT NOT NULL,
  album_id INT REFERENCES album(album_id),
  owner_id INT REFERENCES artist(artist_id),
  language_id INT REFERENCES language(language_id),
  "length" INT,
  release_date DATE,
  song_audio TEXT,
  lyrics TEXT,
  copyright_certificate TEXT
);

CREATE TABLE IF NOT EXISTS "playlist" (
  playlist_id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES asset(asset_id),
  "title" TEXT NOT NULL,
  creator_id INT REFERENCES listener(listener_id),
  "description" TEXT,
  creation_date DATE DEFAULT CURRENT_DATE,
  "visibility" visibility_enum,
  cover_picture TEXT
);

CREATE TABLE IF NOT EXISTS "playlist_song" (
  playlist_id INT REFERENCES playlist(playlist_id),
  song_id INT REFERENCES song(song_id),
  PRIMARY KEY (playlist_id, song_id)
);

CREATE TABLE IF NOT EXISTS "song_artist" (
  song_id INT REFERENCES song(song_id),
  artist_id INT REFERENCES artist(artist_id),
  "role" song_artist_role_enum,
  PRIMARY KEY (song_id, artist_id)
);

CREATE TABLE IF NOT EXISTS "song_genre" (
  song_id INT REFERENCES song(song_id),
  genre_id INT REFERENCES genre(genre_id),
  PRIMARY KEY (song_id, genre_id)
);

CREATE TABLE IF NOT EXISTS "song_mood" (
  song_id INT REFERENCES song(song_id),
  mood_id INT REFERENCES mood(mood_id),
  PRIMARY KEY (song_id, mood_id)
);

CREATE TABLE IF NOT EXISTS "song_instrument" (
  song_id INT REFERENCES song(song_id),
  instrument_id INT REFERENCES instrument(instrument_id),
  PRIMARY KEY (song_id, instrument_id)
);

CREATE TABLE IF NOT EXISTS "song_stream_history" (
  song_stream_id SERIAL PRIMARY KEY,
  listener_id INT REFERENCES listener(listener_id),
  song_id INT REFERENCES song(song_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "duration" INT
);

CREATE TABLE IF NOT EXISTS "album_stream_history" (
  album_stream_id SERIAL PRIMARY KEY,
  listener_id INT REFERENCES listener(listener_id),
  album_id INT REFERENCES album(album_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "duration" INT
);

CREATE TABLE IF NOT EXISTS "playlist_stream_history" (
  playlist_stream_id SERIAL PRIMARY KEY,
  listener_id INT REFERENCES listener(listener_id),
  playlist_id INT REFERENCES playlist(playlist_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "duration" INT
);

CREATE TABLE IF NOT EXISTS "liked_song" (
  listener_id INT REFERENCES listener(listener_id),
  song_id INT REFERENCES song(song_id),
  PRIMARY KEY (listener_id, song_id)
);

CREATE TABLE IF NOT EXISTS "liked_album" (
  listener_id INT REFERENCES listener(listener_id),
  album_id INT REFERENCES album(album_id),
  PRIMARY KEY (listener_id, album_id)
);

CREATE TABLE IF NOT EXISTS "liked_playlist" (
  listener_id INT REFERENCES listener(listener_id),
  playlist_id INT REFERENCES playlist(playlist_id),
  PRIMARY KEY (listener_id, playlist_id)
);

CREATE TABLE IF NOT EXISTS "transaction_history" (
  transaction_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "users"(user_id),
  transaction_type transaction_type_enum,
  amount NUMERIC(10,2),
  payment_method payment_method_enum,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT
);

CREATE TABLE IF NOT EXISTS "plan" (
  plan_id SERIAL PRIMARY KEY,
  plan_type TEXT,
  plan_cost NUMERIC(10,2),
  max_members INT
);

CREATE TABLE IF NOT EXISTS "plan_subscription" (
  subscription_id SERIAL PRIMARY KEY,
  plan_id INT REFERENCES plan(plan_id),
  owner_id INT REFERENCES listener(listener_id),
  start_date DATE,
  end_date DATE,
  transaction_id INT REFERENCES transaction_history(transaction_id),
  auto_renewal_mode auto_renew_enum
);

CREATE TABLE IF NOT EXISTS "family_plan" (
  family_plan_id SERIAL PRIMARY KEY,
  family_name TEXT,
  parent_account_id INT REFERENCES listener(listener_id),
  subscription_id INT REFERENCES plan_subscription(subscription_id)
);

CREATE TABLE IF NOT EXISTS "family_plan_member" (
  family_plan_id INT REFERENCES family_plan(family_plan_id),
  member_id INT REFERENCES listener(listener_id),
  PRIMARY KEY (family_plan_id, member_id)
);

CREATE TABLE IF NOT EXISTS "friend_shared_content" (
  friend_shared_id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES listener(listener_id),
  receiver_id INT REFERENCES listener(listener_id),
  content_id INT REFERENCES asset(asset_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "family_shared_content" (
  family_shared_id SERIAL PRIMARY KEY,
  family_plan_id INT REFERENCES family_plan(family_plan_id),
  sender_id INT REFERENCES listener(listener_id),
  content_id INT REFERENCES asset(asset_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "product" (
  product_id SERIAL PRIMARY KEY,
  asset_id INT UNIQUE REFERENCES asset(asset_id),
  category product_category_enum,
  product_name TEXT,
  owner_id INT REFERENCES artist(artist_id),
  "description" TEXT,
  product_image TEXT,
  price NUMERIC(10,2) CHECK (price >= 0),
  stock_quantity INT CHECK (stock_quantity >= 0),
  expiration_date DATE
);

CREATE TABLE IF NOT EXISTS "cart" (
  cart_id SERIAL PRIMARY KEY,
  owner_id INT REFERENCES listener(listener_id),
  transaction_id INT UNIQUE REFERENCES transaction_history(transaction_id)
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  cart_id INT REFERENCES cart(cart_id),
  product_id INT REFERENCES product(product_id),
  quantity INT CHECK (quantity > 0),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS "badge" (
  badge_id SERIAL PRIMARY KEY,
  badge_name TEXT,
  "description" TEXT,
  image TEXT,
  artist_id INT REFERENCES artist(artist_id)
);

CREATE TABLE IF NOT EXISTS "badge_user" (
  user_id INT REFERENCES "users"(user_id),
  badge_id INT REFERENCES badge(badge_id),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS "approval_request" (
  request_id SERIAL PRIMARY KEY,
  content_id INT REFERENCES asset(asset_id)
);

CREATE TABLE IF NOT EXISTS "announcement" (
  announcement_id SERIAL PRIMARY KEY,
  announcer_id INT REFERENCES "users"(user_id),
  text TEXT,
  image TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "content_review" (
  review_id SERIAL PRIMARY KEY,
  reviewer_id INT REFERENCES listener(listener_id),
  topic_id INT REFERENCES asset(asset_id),
  text TEXT,
  rating INT CHECK (rating BETWEEN 0 AND 5),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "artist_review" (
  review_id SERIAL PRIMARY KEY,
  reviewer_id INT REFERENCES listener(listener_id),
  artist_id INT REFERENCES artist(artist_id),
  text TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "report" (
  report_id SERIAL PRIMARY KEY,
  author_id INT REFERENCES "users"(user_id),
  topic_id INT REFERENCES asset(asset_id),
  text TEXT,
  image TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "admin_activity_log" (
  activity_id SERIAL PRIMARY KEY,
  admin_id INT REFERENCES admin(admin_id),
  activity_details TEXT,
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
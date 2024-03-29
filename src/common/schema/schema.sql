CREATE DATABASE blog-api;

CREATE TABLE IF NOT EXISTS Categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role    VARCHAR(100) DEFAULT 'reader',
  posts JSONB[],
  notifications JSONB[],
  verified BOOLEAN DEFAULT FALSE,
  vertoken  VARCHAR(255),
  verExp    TIMESTAMP,
  reset_token VARCHAR(255),
  reset_token_exp TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  likes   INTEGER DEFAULT 0 NOT NULL,
  user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  liked_by JSONB[],
  comments JSONB[],
  categories JSONB[],
  category_id INTEGER NOT NULL REFERENCES Categories(id) ON DELETE SET NULL,
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE Comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  post_id INTEGER NOT NULL REFERENCES Posts(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES Users(id),
  post_id INTEGER NOT NULL REFERENCES Posts(id),
  creeated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES Users(id),
  following_id INTEGER NOT NULL REFERENCES Users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES Users(id),
  type VARCHAR(255) NOT NULL,
  content TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");


CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timestamp_trigger
BEFORE UPDATE ON Users
FOR EACH ROW

ALTER TABLE Posts
ADD COLUMN search_vector tsvector;

-- CREATE OR REPLACE FUNCTION update_post_comments()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     UPDATE Posts
--     SET comments = jsonb_agg(c)
--     FROM (
--         SELECT json_build_object(
--             'id', c.id,
--             'content', c.content,
--             'user_id', c.user_id,
--             'created_at', c.created_at,
--             'updated_at', c.updated_at
--         ) AS c
--         FROM Comments c
--         WHERE c.post_id = NEW.post_id
--     ) AS sub
--     WHERE Posts.id = NEW.post_id;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comments()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Posts
    SET comments = (
        SELECT array_agg(comment)
        FROM (
            SELECT unnest(coalesce(Posts.comments, '{}'::jsonb[])) || jsonb_build_object(
                'id', c.id,
                'content', c.content,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
            ) AS comment
            FROM Comments c
            WHERE c.post_id = NEW.post_id
        ) AS sub
    )
    WHERE Posts.id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER after_comment_insert
AFTER INSERT ON Comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments();
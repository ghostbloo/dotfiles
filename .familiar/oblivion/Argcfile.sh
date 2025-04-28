#!/usr/bin/env bash
set -e

OBLIVION_DIR="$HOME/.familiar/oblivion"
DB_PATH="$OBLIVION_DIR/oblivion.db"

# @cmd Insert a post into the database
# @arg content The text of the post
post() {
  echo "DEBUG: argc_text = [$argc_content]" 
  sqlite3 "$DB_PATH" <<EOF
.parameter set @text "$argc_content"
INSERT INTO posts (text) VALUES (@text);
EOF
}

# @cmd Delete a post from the database
# @arg id The id of the post
delete() {
  sqlite3 "$DB_PATH" "DELETE FROM posts WHERE id = '$argc_id'"
}

# @cmd Initialize the database schema
init() {
  if [[ ! -f "$DB_PATH" ]]; then
    touch "$DB_PATH"
  fi
  sqlite3 "$DB_PATH" < "$OBLIVION_DIR/schema.sql"
}

# @cmd Read all posts from the database
read() {
  sqlite3 "$DB_PATH" "SELECT * FROM posts"
}

# See more details at https://github.com/sigoden/argc
eval "$(argc --argc-eval "$0" "$@")"

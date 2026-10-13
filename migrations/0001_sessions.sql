CREATE TABLE hack_sesh (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 "user" TEXT NOT NULL UNIQUE,
 url TEXT, description TEXT, tags TEXT, count INTEGER,
 mtime TEXT, ctime TEXT
);

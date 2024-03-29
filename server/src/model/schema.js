require('../../config.js');
require('dotenv').config()
console.log(process.env.DB_URL);
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);
 
// tests connection and returns Postgres server version,
// if successful; or else rejects with connection error:
async function testConnection() {
    console.log('Testing connection to Postgres server...');
    const c = await db.connect(); // try to connect
    c.done(); // success, release connection
    console.log('Connected to Postgres server.');
    return c.client.serverVersion; // return server version
}

testConnection().then(version => {
    console.log('Postgres server version:', version);
}).catch(err => {
    console.log('Error testing connection to Postgres server:');
    console.log(err);
});

const schemaSql = `
    -- Extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    -- Drop (droppable only when no dependency)
    DROP INDEX IF EXISTS posts_idx_text;
    DROP INDEX IF EXISTS posts_idx_ts;
    DROP INDEX IF EXISTS todos_idx_text;
    DROP INDEX IF EXISTS todos_idx_ts;
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS todos;
    DROP TYPE IF EXISTS mood;

    -- Create
    CREATE TYPE mood AS ENUM (
        'Clear',
        'Clouds',
        'Drizzle',
        'Rain',
        'Thunder',
        'Snow',
        'Windy'
    );
    CREATE TABLE posts (
        id              serial PRIMARY KEY NOT NULL,
        mood            mood NOT NULL,
        text            text NOT NULL,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now())),
        "clearVotes"    integer NOT NULL DEFAULT 0,
        "cloudsVotes"   integer NOT NULL DEFAULT 0,
        "drizzleVotes"  integer NOT NULL DEFAULT 0,
        "rainVotes"     integer NOT NULL DEFAULT 0,
        "thunderVotes"  integer NOT NULL DEFAULT 0,
        "snowVotes"     integer NOT NULL DEFAULT 0,
        "windyVotes"    integer NOT NULL DEFAULT 0
    );
    CREATE INDEX posts_idx_ts ON posts USING btree(ts);
    CREATE INDEX posts_idx_text ON posts USING gin(text gin_trgm_ops);

    CREATE TABLE todos (
        id              serial PRIMARY KEY NOT NULL,
        mood            mood NOT NULL,
        text            text NOT NULL,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now())),
        "doneTs"        bigint DEFAULT NULL
    );
    CREATE INDEX todos_idx_ts ON posts USING btree(ts);
    CREATE INDEX todos_idx_text ON posts USING gin(text gin_trgm_ops);
`;

const dataSql = `
    -- Populate dummy todos
    INSERT INTO todos (mood, text)
    SELECT
        'Clear',
        'word' || i || ' word' || (i+1) || ' word' || (i+2)
    FROM generate_series(1, 1000000) AS s(i);

    INSERT INTO posts (mood, text)
    SELECT
        'Clear',
        'word' || i || ' word' || (i+1) || ' word' || (i+2)
    FROM generate_series(1, 1000000) AS s(i);
`;

// Create the schema and populate dummy data
db.none(schemaSql).then(() => {
    console.log('Schema created');
    db.none(dataSql).then(() => {
        console.log('Data populated');
        pgp.end();
    });
}).catch(err => {
    console.log('Error creating schema', err);
});


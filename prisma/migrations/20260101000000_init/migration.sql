CREATE TABLE IF NOT EXISTS "Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "options" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "allowWriteIn" BOOLEAN NOT NULL DEFAULT false,
    "deadline" DATETIME,
    "adminHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "voterPasswordHash" TEXT
);

CREATE TABLE IF NOT EXISTS "Ballot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "rankings" TEXT NOT NULL,
    "voterToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ballot_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Ballot_pollId_voterToken_key" ON "Ballot"("pollId", "voterToken");

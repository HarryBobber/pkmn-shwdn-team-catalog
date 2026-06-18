-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "format" TEXT,
    "tier" TEXT,
    "notes" TEXT,
    "rawPaste" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "species" TEXT NOT NULL,
    "nickname" TEXT,
    "item" TEXT,
    "ability" TEXT,
    "nature" TEXT,
    "level" INTEGER NOT NULL DEFAULT 100,
    "gender" TEXT,
    "teraType" TEXT,
    "moves" JSONB NOT NULL,
    "evs" JSONB,
    "ivs" JSONB,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "won" BOOLEAN,
    "opponent" TEXT,
    "format" TEXT,
    "pokemonAlive" INTEGER,
    "peakRank" INTEGER,
    "playedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Battle_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_slot_key" ON "TeamMember"("teamId", "slot");

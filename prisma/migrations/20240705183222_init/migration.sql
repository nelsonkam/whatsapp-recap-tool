-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL,
    "short_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "quoted_message_id" INTEGER,
    "quoted_message_xid" TEXT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_short_id_key" ON "Message"("short_id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_external_id_key" ON "Message"("external_id");

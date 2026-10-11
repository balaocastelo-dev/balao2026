-- As tabelas da Evolution 2.3.7 que as consultas quentes tocam, com os MESMOS
-- tipos e índices que as migrações dela criam (prisma/postgresql-migrations,
-- conferido na imagem oficial v2.3.7). Serve só para a bancada e o teste de
-- índices; na loja quem cria isto é a própria Evolution.

DROP TABLE IF EXISTS "Message", "Chat", "Contact", "Instance" CASCADE;
DROP TYPE IF EXISTS "InstanceConnectionStatus", "DeviceMessage";

CREATE TYPE "InstanceConnectionStatus" AS ENUM ('open', 'close', 'connecting');
CREATE TYPE "DeviceMessage" AS ENUM ('ios', 'android', 'web', 'unknown', 'desktop');

CREATE TABLE "Instance" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "connectionStatus" "InstanceConnectionStatus" NOT NULL DEFAULT 'open',
    "ownerJid" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Instance_name_key" ON "Instance"("name");

CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "remoteJid" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100),
    "labels" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "instanceId" TEXT NOT NULL,
    "unreadMessages" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Chat_instanceId_idx" ON "Chat"("instanceId");
CREATE INDEX "Chat_remoteJid_idx" ON "Chat"("remoteJid");
CREATE UNIQUE INDEX "Chat_instanceId_remoteJid_key" ON "Chat"("instanceId", "remoteJid");

CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "remoteJid" VARCHAR(100) NOT NULL,
    "pushName" VARCHAR(100),
    "profilePicUrl" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "instanceId" TEXT NOT NULL,
    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Contact_remoteJid_idx" ON "Contact"("remoteJid");
CREATE INDEX "Contact_instanceId_idx" ON "Contact"("instanceId");
CREATE UNIQUE INDEX "Contact_remoteJid_instanceId_key" ON "Contact"("remoteJid", "instanceId");

CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "key" JSONB NOT NULL,
    "pushName" VARCHAR(100),
    "participant" VARCHAR(100),
    "messageType" VARCHAR(100) NOT NULL,
    "message" JSONB NOT NULL,
    "contextInfo" JSONB,
    "source" "DeviceMessage" NOT NULL,
    "messageTimestamp" INTEGER NOT NULL,
    "chatwootMessageId" INTEGER,
    "chatwootInboxId" INTEGER,
    "chatwootConversationId" INTEGER,
    "chatwootContactInboxSourceId" VARCHAR(100),
    "chatwootIsRead" BOOLEAN,
    "instanceId" TEXT NOT NULL,
    "webhookUrl" VARCHAR(500),
    "status" VARCHAR(30),
    "sessionId" TEXT,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
-- Migração 20241017144950_create_index: o ÚNICO índice que a Evolution põe.
CREATE INDEX "Message_instanceId_idx" ON "Message"("instanceId");

ALTER TABLE "Chat" ADD CONSTRAINT "Chat_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Instance" ("id", "name") VALUES ('inst-bancada', 'loja');

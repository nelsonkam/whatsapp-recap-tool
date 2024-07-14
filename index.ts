
import { Client, LocalAuth, MessageTypes } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getAllMessages } from "./messages";
import { writeFile } from "fs/promises";

const prisma = new PrismaClient();
const client = new Client({ authStrategy: new LocalAuth() });

async function saveMessage(message: any) {
  if (message.type !== MessageTypes.TEXT) return;

  // Check if the message already exists in the database
  const existingMessage = await prisma.message.findUnique({
    where: { external_id: message.id._serialized },
  });

  if (existingMessage) {
    console.log(`Message ${message.id._serialized} already exists, skipping.`);
    return;
  }

  let quoteId;
  if (message.hasQuotedMsg) {
    quoteId = (await message.getQuotedMessage()).id._serialized;
  }

  const data = {
    short_id: nanoid(),
    timestamp: new Date(message.timestamp * 1000),
    content: message.body,
    author_id: message.author,
    external_id: message.id._serialized,
    quoted_message_xid: quoteId,
  };

  try {
    await prisma.message.create({ data });
    console.log(`Saved message ${message.id._serialized}`);
  } catch (err) {
    const errorMessage = `Could not save message (${message.id._serialized}). Reason: ${err.message} \n`;
    await writeFile("./error.log", errorMessage, { flag: 'a' });
    console.error(errorMessage);
  }
}

async function processMessages() {
  console.log("Client is ready!");
  const chat = await client.getChatById("120363043790757321@g.us");

  for await (const messages of getAllMessages(chat)) {
    for (const message of messages) {
      await saveMessage(message);
    }
  }
  console.log("All messages processed!");
}

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", processMessages);

client.initialize();

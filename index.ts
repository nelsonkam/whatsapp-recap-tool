
const { Client, LocalAuth, MessageTypes } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getAllMessages, playground } from "./messages";
const prisma = new PrismaClient();
// Create a new client instance
const client = new Client({
  authStrategy: new LocalAuth(),
});

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  console.log("Client is ready!");
  const chats = await client.getChats();
  // console.log(chats.map((i) => `${i.id._serialized} - ${i.name}`).join("\n"));
  // const chatNames = await client
  //   .getChats()
  //   .map((i) => `${i.id} - ${i.name}`)
  //   .join("\n");
  // console.log(chatNames);
  const chat = await client.getChatById("120363043790757321@g.us");
  // const messages = await chat.fetchMessages({ limit: Infinity });
  // console.log(await playground(chat));
  for await (const messages of getAllMessages(chat)) {
    for (const message of messages) {
      console.log(`Adding message ${message.type}`);
      if (message.type === MessageTypes.TEXT) {
        let quoteId;
        if (message.hasQuotedMsg) {
          quoteId = (await message.getQuotedMessage()).id._serialized;
        }
        console.log(message.timestamp)
        const data = {
          short_id: nanoid(),
          timestamp: new Date(message.timestamp * 1000),
          content: message.body,
          author_id: message.author,
          external_id: message.id._serialized,
          quoted_message_xid: quoteId,
        };
        console.log(data);
        try {
          await prisma.message.create({
            data,
          });
        } catch (err) {
          await Bun.write(
            "./error.log",
            `Could not save message (${message.id._serialized}). Reason: ${err.message} \n`
          );
          console.log(
            `Could not save message (${message.id._serialized}). Reason: ${err.message} \n`
          );
        }
      }
      console.log(`Done message ${message.id._serialized}`);
    }
    console.log("All done!");
  }
  // console.log("Message length: " + messages.length);
  // for (const message of messages) {
});

// When the client received QR-Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Start your client
client.initialize();

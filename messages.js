const { Message } = require("whatsapp-web.js");

export async function* getAllMessages(chat) {
  try {
    // Fetch initial messages
    const initialMessages = await fetchMessages(chat, "initial");
    yield initialMessages;

    // Fetch earlier messages
    while (true) {
      console.log("Loading earlier messages...");
      const msgs = await fetchMessages(chat, "earlier");
      if (!msgs || msgs.length === 0) break;
      yield msgs;
    }

    console.log("Fetching done!");
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

async function fetchMessages(chat, type) {
  const result = await chat.client.pupPage.evaluate(
    async (chatId, fetchType) => {
      const chat = window.Store.Chat.get(chatId);
      let messages;

      if (fetchType === "initial") {
        messages = chat.msgs.getModelsArray().filter((m) => !m.isNotification);
      } else {
        messages = await window.Store.ConversationMsgs.loadEarlierMsgs(chat);
        messages = messages.filter((m) => !m.isNotification);
      }

      return messages.map((m) => window.WWebJS.getMessageModel(m));
    },
    chat.id._serialized,
    type
  );

  return result.map((m) => new Message(chat.client, m));
}

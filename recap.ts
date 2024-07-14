import { Message, PrismaClient } from "@prisma/client";
import OpenAI from "openai";
const prisma = new PrismaClient();
export function formatMessage(message: Message & { quoted_message: string }) {
  const quote = message.quoted_message
    ? message.quoted_message
        .split("\n")
        .map((m) => `> ${m}`)
        .join(`\n`) + "\n\n"
    : "";
  return `[${new Date(message.timestamp).toISOString()}] ${
    message.author_id
  }: ${quote} ${message.content}`;
}

export async function getRecapInput() {
  const messages: (Message & { quoted_message: string })[] =
    await prisma.$queryRaw`select m.*, q.content as quoted_message from Message m
      left join Message q on m.quoted_message_xid = q.external_id 
      where m.timestamp >= ${new Date("2024-07-05").getTime()}
      order by m.timestamp;`;
  return messages.map((m) => formatMessage(m)).join("\n");
}

async function generateRecap() {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_KEY,
    defaultHeaders: {
      // "HTTP-Referer": $YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
      // "X-Title": $YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
    },
  });
  const systemPrompt = `You'll be provided a chat history by the user. Quoted messages are identified with a "> " prefix. 
  You are tasked with identifying threads in the conversations and report each of those threads and the conversations within those. 
  You can add as much detail as needed. 
  Do not leave important details out.
  Always add key links shared at the end of the digest.
  Do not identify the participants.
  You should respond in markdown.`;
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: await getRecapInput() },
    ],
  });
  return completion.choices[0].message.content;
}

console.log(await generateRecap());

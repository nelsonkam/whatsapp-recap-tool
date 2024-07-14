import { Message, PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY,
  defaultHeaders: {
    // "HTTP-Referer": $YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
    // "X-Title": $YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
  },
});
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

export async function getRecapInput(date: Date) {
  const start = startOfDay(date);
  const end = endOfDay(date);
  
  const messages: (Message & { quoted_message: string })[] =
    await prisma.$queryRaw`select m.*, q.content as quoted_message from Message m
      left join Message q on m.quoted_message_xid = q.external_id 
      where m.timestamp >= ${start.getTime()} and m.timestamp <= ${end.getTime()}
      order by m.timestamp;`;
  return messages.map((m) => formatMessage(m)).join("\n");
}

export async function generateRecap(date: Date) {
  const systemPrompt = `You'll be provided with a chat history. Analyze and summarize it as follows:

1. Identify main conversation threads and topics.
2. For each thread:
   - Summarize the key points and discussions.
   - Highlight any decisions made or actions agreed upon.
   - Note any unresolved questions or issues.
3. Capture important details, ensuring nothing significant is omitted.
4. List all shared links at the end of the digest, categorized if possible.
5. Do not identify specific participants; use neutral terms like "a user" or "the team".
6. Format your response in Markdown, using headers, bullet points, and other formatting for clarity.
7. If applicable, note any recurring themes or patterns in the conversations.
8. Highlight any particularly important or urgent matters that were discussed.

Your goal is to provide a comprehensive yet concise overview that allows someone who wasn't part of the conversation to quickly understand what was discussed and what's important.`;
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: await getRecapInput(date) },
    ],
  });
  return completion.choices[0].message.content;
}

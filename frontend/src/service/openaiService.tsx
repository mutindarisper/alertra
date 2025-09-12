import { OpenAI } from 'openai';
const apiKey = import.meta.env.VITE_OPENAI_ACCESS_TOKEN

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

export const getChatbotResponse = async (userQuery:string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.0',
    messages: [{ role: 'user', content: userQuery }],
  });
  return response.choices[0].message.content;
};

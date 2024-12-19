import { AzureOpenAI } from "openai";

const endpoint = process.env.OPENAI_ENDPOINT || "";
const apiKey = process.env.OPENAI_API_KEY || "";
const apiVersion = "2024-04-01-preview";
const deployment = "gpt-35-turbo-instruct";

const client = new AzureOpenAI({
  endpoint: endpoint,
  apiKey: apiKey,
  apiVersion: apiVersion,
  deployment: deployment,
});

export async function getHealthTips(prompt: string) {
  const response = await client.completions.create({
    model: "gpt-35-turbo-instruct",
    prompt: [prompt],
    max_tokens: 512,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  console.log(prompt, response);
  return response.choices[0].text;
}

export async function getPersonalSuggestions(habits: {
  sleep: string;
  calories: string;
  exercise: string;
  water: string;
}) {
  const prompt = `Based on my habits like Sleep: ${habits.sleep}\nCalories: ${habits.calories}\nExercise: ${habits.exercise}\nWater: ${habits.water}, what are some personalized suggestions to improve my health?`;
  const response = await client.completions.create({
    model: "gpt-35-turbo-instruct",
    prompt: [prompt],
    max_tokens: 512,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  console.log(prompt, response);
  return response.choices[0].text;
}

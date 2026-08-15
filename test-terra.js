const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
openai.chat.completions.create({
  model: "gpt-5.6-terra",
  messages: [{ role: "user", content: "Say hello" }],
  max_completion_tokens: 50,
}).then(r => console.log(JSON.stringify(r, null, 2)))
  .catch(e => console.log("ERROR:", e.message));

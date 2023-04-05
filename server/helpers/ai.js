const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.CODING_EXAM_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateFeedback(question, answer) {

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Please tell me if "${answer}" is a good answer to the question "${question}".`,
    temperature: 0
  })

  return response.data.choices[0].text;
}

async function grade(question, answer) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Please rate the answer "${answer}" on a scale of 0 to 10 how well it addresses the question "${question}".`,
    temperature: 0
  })

  const matches = /(\d+) out of 10/.exec(response.data.choices[0])
  return parseInt(matches && matches[1]) || 0;
}

module.exports = { generateFeedback, grade }
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.CODING_EXAM_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Generates feedback to a student using OpenAI
 * @param {string} question - the question being asked
 * @param {string} answer - the student's answer 
 * @returns A string containing feedback on the appropriateness
 * of the answer
 */
async function generateFeedback(question, answer) {

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Please tell me if "${answer}" is a good answer to the question "${question}".`,
    temperature: 0,
    max_tokens: 100
  })

  return response.data.choices[0].text;
}

/** 
 * Uses OpenAI to grade a student response to a question
 * @param {string} question - The question being asked 
 * @param {string} answer - The student's response
 * @returns a grade between 0 and 100
 */
async function grade(question, answer) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Please rate the answer "${answer}" on a scale of 0 to 100 how well it addresses the question "${question}".`,
    temperature: 0
  })
  const matches = /(\d+) out of 100/.exec(response.data.choices[0].text)
  return parseInt(matches && matches[1]) || 0;
}

module.exports = { generateFeedback, grade }
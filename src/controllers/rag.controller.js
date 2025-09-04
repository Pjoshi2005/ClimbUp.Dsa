import { db } from "../libs/db.js";
import "dotenv/config";



const client = new OpenAI({
  baseURL : "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
}) 
const problemSummarizerPrompt = ({
  problemId,
  title,
  description,
  constraints,
  examples,
  query,
}) => {
  return `
You are **Problem Summarizer Bot**. Follow these rules strictly:

### Rules:
1. If input contains a coding problem (with details like problemId, title, description, constraints, examples, or query), output only the **summary** in a clean, human-readable way.  
   - Keep it short, structured, and beginner-friendly.  
   - Do not include extra formatting like "Problem ID:" labels, just the plain summary text.  
   - Example style:  
     "Add Two Numbers — Given two integers a and b, return their sum. Constraints: a,b between -10^9 and 10^9. Example: Input: a=3, b=5 → Output: 8."  

2. If the user greets you (e.g., "hi", "hello"), reply with a short greeting (e.g., "Hello! How can I help you with a problem today?").  

3. If the user asks something unrelated to problems, politely refuse with one short line (e.g., "I can only help with summarizing coding problems.").  

4. **Never provide code solutions.**  

### Input Provided:
- Problem ID: ${problemId}
- Title: ${title}
- Description: ${description}
- Constraints: ${constraints}
- Examples: ${examples}
- User Query: ${query}

### Expected Output:
Only the direct AI response (summary, greeting, or refusal). Nothing else.
  `;
};

export const problemSummarizerBot = async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.body;

    if (!id) {
      return res.status(401).json({ error: "Id is required" });
    }

    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(401).json({ error: "Problem not found" });
    }

    const prompt = problemSummarizerPrompt({
      problemId: id,
      title: problem.title,
      description: problem.description,
      constraints: problem.constraints,
      examples: problem.examples,
      query,
    });
    const response = await client.chat.completions.create({
      model: "---------------->",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    const content = response.choices[0].message.content;

    return res.status(200).json({
      success: true,
      content,
      message: "Respone from ChatBot",
    });

  } catch (error) {
    console.log(error);
  }
};

import { getJudge0LanguageId, submitBatch ,pollBatchResults } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippet,
    hints,
    editorial,
    referenceSolution,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not allowed to create a problem" });
  }
  try {
    for(const[language , solutionCode] of Object.entries(referenceSolution)){
      const languageId = getJudge0LanguageId(language)

      if(!languageId){
        return res
        .status(400)
        .json({
          error : ` Language ${language} is not supported`
        })
      }
      //
      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions)
      const tokens = submissionResults.map((res) => res.token)
      const results = await pollBatchResults(tokens);

      for(let i = 0 ; i < results.length ; i++){
        const result = results[i]
        if(result.status.id !==3){
          return res.status(400).json({
            error : `Reference solution for ${language} failed on test case ${i+1}`,
          });
        }
      }

      const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippet,
        referenceSolution,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      sucess: true,
      message: "Message Created Successfully",
      problem: newProblem,
    });

    }

    
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Error While Creating Problem"})
    
  }
};
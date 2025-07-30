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

export const getAllProblem = async(req , res) => {
  try {
    const problem = await db.problem.findMany()

    if(!problem){
      return res.status(401).json({error : "No Problems found"})
    }

    res.status(201).json({
      data : problem,
      sucess : true,
      message : "Problems fetched successfully"
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({error : "Error while fetching problems"})
  }
};

export const getProblemById = async(req , res) => {
  try { 
    const {id} = req.params

  if(!id){
    res.status(401).json({error : "Invalid Id"})
  }

  const problem = await db.problem.findUnique({
    where : {
      id
    },
  });
  if(!problem){
  return res.status(401).json({error : "Problem Not Found"})
  }
   return res.status(201).json({
    data : problem,
    sucess : true,
    message : "Problem Fetched Successfully"
   }) 
  } catch (error) {
    console.log(error)
    return res.status(500).json({error : "Error occured while fetching this problem"})
  }
}

export const updateProlem = async(req , res) => {
  try {
    const {id} = req.params
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
   } = req.body

   const problem = await db.update({
    where : {
      id
    },
    data: {
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
      },
   });

   if(!problem){
    return res.status(401).json({error : "Updation Failed !"})
   }
   res.status(201).json({
    data : problem,
    success : true,
    message : "Changes Updated!"
   });
  } catch (error) {
    console.log(error);
    return res.status(500).json({error : "Error occured while Updating Problem"})

    
  }
}
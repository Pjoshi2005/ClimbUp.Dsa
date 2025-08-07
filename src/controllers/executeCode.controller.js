import { verify } from "jsonwebtoken";
import { submitBatch  , pollBatchResults , getLanguageName} from "../libs/judge0.lib.js";
export const runCode = async(req , res) => {
    const {source_code, language_id, stdin, expected_outputs} = req.body
    try {
        if(
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length 
        ) {
            return res.status(400).json({ error: "Invalid testCases array" });
        }
//      looping over all inputs that we have passed in an array ["2  3" , " 1  7"]
        const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input,
        }))

        const submitResponse = await submitBatch(submissions);
        const token = submitResponse.map((res) => res.token)
        const results = await pollBatchResults(token) 

        let allPassed = true ;
        const detailedResults = results.map((results , index) =>{
            const stdout = results.stdout?.trim ;
            const expected_output = expected_outputs[index].trim() ;
            const passed = expected_output === stdout ;
            if(!passed) allPassed = false;
            
            return {
                testCase : index + 1,
                passed,
                stdout,

            }
        })
    } catch (error) {
        
    } 
}
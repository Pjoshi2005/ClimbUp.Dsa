import { verify } from "jsonwebtoken";
import { submitBatch, pollBatchResults, getLanguageName } from "../libs/judge0.lib.js";
export const runCode = async (req, res) => {
    const { source_code, language_id, stdin, expected_outputs } = req.body
    try {
        if (
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

        let allPassed = true;
        const detailedResults = results.map((result, index) => {
            const stdout = result.stdout?.trim;
            const expected_output = expected_outputs[index].trim();
            const passed = expected_output === stdout;
            if (!passed) allPassed = false;

            return {
                testCase: index + 1,
                passed,
                stdout,
                expected: expected_output || null,
                stderr: result.stderr,
                compileOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined,

            }
        });
        return res.status(200).json({
            message: "Code executed successfully",
            success: true,
            //we can name anything to our key like outcome instead of results testCase these all key name doent link with above array name and all
            results: {
                status: allPassed ? "Accepted" : "Wrong Answer",
                testCases: detailedResults,
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error While Running Code" })
    }
}
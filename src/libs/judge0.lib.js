import axios from "axios";


export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT:  63,
  }
  return languageMap[language.toUpperCase()]
}

export const getLanguageName = (languageId) => {
  const LANGUAGE_NAMES = {
      71 : "PYTHON" , 
      62 : "JAVA" ,
      63 : "JAVASCRIPT",
  }
}
//we are getting token from this below code
export const submitBatch = async (submissions) => {
  try {
    const Options = {
      method : "POST",

      url : `${process.env.JUDGE0_API_URL}/submissions/batch`,

      headers : {
        "Content-Type" : "application/json",
        "Accept" :"application/json",
        "Authorization" : `Bearer ${process.env.JUDGE0_TOKEN}`,
      },
        data : {
          submissions
        }
    };

    const {data} = await axios.request(Options);
    console.log("Submission Results", data)
    return data

  } catch (error) {
    console.error(
      "Error submitting Batch:",
      error.response?.data || error.message
    )
     throw error
  }

}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const pollBatchResults = async(tokens) => {
  const maxAttempts = 30
  let attempts = 0

  while(attempts < maxAttempts){
    try {
    const {data} = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
     
      {
        params : {
          tokens : tokens.join(","),
          base64_encoded : false,
        },
        headers: {
            Authorization: `Bearer ${process.env.JUDGE0_TOKEN}`,
          },
      }
    )
    const result = data.submissions;

    const isAlldone= result.every(
      (result) => result.status.id !== 1 && result.status.id !== 2
    )

    if(isAlldone) {
      return result
    }

    await sleep(1000);
    attempts++;

      
    } catch (error) {
      console.error(
        "Error Polling results:",
        error.response?.data || error.message
        )
        throw error
      
    }
  }
  throw new Error("Polling timeout : Results took too long to process")
};

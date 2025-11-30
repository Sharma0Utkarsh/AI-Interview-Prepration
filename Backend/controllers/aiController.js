const {GoogleGenerativeAI} = require("@google/generative-ai"); // Changed to match your new code
    const {conceptExplainPrompt, questionAnswerPrompt} = require("../utils/prompts");
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Changed to match your new code
    
    //@desc Generate interview questions and answers using Gemini
    //@route POST/api/ai/generate-questions
    //@access Private
    const generateInterviewQuestion = async (req,res)=>{
    try {
    
        const {role, experience, topicsToFocus, numberOfQuestions} = req.body;
    
        if(!role || !experience ||! topicsToFocus|| !numberOfQuestions){
            return res.status(400).json({ message: "Missing required fileds"});
        }
    
        const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
    
        // Use the new v1beta API structure
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" }); // Using 2.5 flash
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let rawText = response.text();
    
        //Clean it: Remove``` from begining and ending```
    
        const cleanedText = rawText
        .replace(/^```json\s*/,"")//Remove starting```json
        .replace(/```$/,"")// removes ending
        .trim();//Remove extra spaces
    
        //Now safe to paste
        const data = JSON.parse(cleanedText);
    
        res.status(200).json(data);
    
        
    } catch (error) {
        console.error("Error in generateInterviewQuestion:", error); // Added console.error for debugging
        res.status(500).json({
            message: "Failed to generate questions",
            error: error.message,
        });
        
    }
    };
    
    //@desc Generate explains a interview questions
    //@route POST/api/ai/generate-explaination
    //@access Private
    
    const generateConceptExplanation = async (req,res)=>{
        try {
    
            const {question } = req.body;
            if(!question){
                return res.status(400).json({message: "Missing required fields"});
    
            }
    
            const prompt  = conceptExplainPrompt(question);
                
            // Use the new v1beta API structure
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" }); // Using 2.5 flash
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let rawText = response.text();
    
            //Clean it :Remove ```Json and ``` from beginning and end
            const cleanedText = rawText
        .replace(/^```json\s*/,"")//Remove starting```json
        .replace(/```$/,"")// removes ending
        .trim();//Remove extra spaces
    
        //Now safe to parse
    
        const data = JSON.parse(cleanedText);
    
        res.status(200).json(data);
            
        } catch (error) {
            console.error("Error in generateConceptExplanation:", error); // Added console.error for debugging
            res.status(500).json({
            message: "Failed to generate explanation", // Corrected typo
            error: error.message,
        });
        }
    };
    
    module.exports = {generateInterviewQuestion,generateConceptExplanation};
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Helper to safely parse JSON from Gemini's response.
 * Handles cases where the AI wraps JSON in ```json ... ``` blocks.
 */
const parseAIResponse = (rawText) => {
    try {
        const cleanedText = rawText
            .replace(/```json/g, "") // Remove markdown header
            .replace(/```/g, "")     // Remove markdown footer
            .trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse AI JSON. Raw text was:", rawText);
        throw new Error("AI returned invalid JSON format.");
    }
};

/**
 * @desc Generate interview questions and answers
 * @route POST /api/ai/generate-question
 */
const generateInterviewQuestion = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Use the current stable 2026 model: gemini-3-flash-preview
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = parseAIResponse(response.text());

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in generateInterviewQuestion:", error);
        res.status(500).json({
            message: "Failed to generate questions",
            error: error.message,
        });
    }
};

/**
 * @desc Generate explanation for a specific question
 * @route POST /api/ai/generate-explanation
 */
const generateConceptExplanation = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ message: "Missing required field: question" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = conceptExplainPrompt(question);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = parseAIResponse(response.text());

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in generateConceptExplanation:", error);
        res.status(500).json({
            message: "Failed to generate explanation",
            error: error.message,
        });
    }
};

module.exports = { generateInterviewQuestion, generateConceptExplanation };
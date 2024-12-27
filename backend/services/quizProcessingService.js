import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js"; // import pdf from "pdf-parse";
import mammoth from "mammoth";
import { Quiz } from "../models/Quiz.js";

const validateQuestion = (question) => {
  // Ensure all required fields are present and valid
  if (!question.question || typeof question.question !== "string") return false;
  if (!Array.isArray(question.options) || question.options.length !== 4)
    return false;
  if (
    !question.correctAnswer ||
    !["a", "b", "c", "d"].includes(question.correctAnswer.toLowerCase())
  )
    return false;

  // Ensure all options have content
  if (question.options.some((opt) => !opt || typeof opt !== "string"))
    return false;

  return true;
};

const parseQuizContent = (content) => {
  try {
    // Split content into sections based on numbered questions
    const sections = content.split(/\d+\.\s+/).filter(Boolean);

    const questions = sections
      .map((section) => {
        try {
          // Split section into lines and remove empty ones
          const lines = section.split("\n").filter((line) => line.trim());

          if (lines.length < 2) return null;

          const questionData = {
            question: lines[0].trim(),
            options: [],
            correctAnswer: "",
            explanation: "",
            points: 1, // Default points value
          };

          let isParsingOptions = false;
          let isParsingExplanation = false;

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check for points marker
            if (line.toLowerCase().startsWith("points:")) {
              const points = parseInt(line.replace(/^points:\s*/i, ""));
              if (!isNaN(points) && points > 0) {
                questionData.points = points;
              }
              continue;
            }

            // Check for option markers
            const optionMatch = line.match(/^([a-d])\)\s+(.+)/i);
            if (optionMatch) {
              isParsingOptions = true;
              const [, letter, text] = optionMatch;
              const optionIndex = letter.toLowerCase().charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
              questionData.options[optionIndex] = text.trim();
              continue;
            }

            // Check for correct answer marker
            if (line.toLowerCase().startsWith("answer:")) {
              const answer = line
                .replace(/^answer:\s*/i, "")
                .trim()
                .toLowerCase();
              if (["a", "b", "c", "d"].includes(answer)) {
                questionData.correctAnswer = answer;
              }
              isParsingOptions = false;
              continue;
            }

            // Check for explanation marker
            if (line.toLowerCase().startsWith("explanation:")) {
              isParsingExplanation = true;
              questionData.explanation = line
                .replace(/^explanation:\s*/i, "")
                .trim();
              continue;
            }

            // Append to explanation if we're in explanation section
            if (isParsingExplanation) {
              questionData.explanation += " " + line;
            }
          }

          return validateQuestion(questionData) ? questionData : null;
        } catch (error) {
          console.error("Error parsing question section:", error);
          return null;
        }
      })
      .filter(Boolean); // Remove any invalid questions

    return questions;
  } catch (error) {
    console.error("Error parsing content:", error);
    return [];
  }
};

export const processQuizFile = async (quizId, files) => {
  try {
    const quiz = await Quiz.findById(quizId);
    quiz.processingStatus = "processing";
    await quiz.save();

    const processedQuestions = [];

    for (const file of files) {
      let content = "";

      try {
        switch (file.mimetype) {
          case "text/plain":
            content = await fs.readFile(file.path, "utf-8");
            break;

          case "application/pdf":
            try {
              const dataBuffer = await fs.readFile(file.path);
              const pdfData = await pdf(dataBuffer, {
                // Add these options to avoid test file dependency
                max: 0,
                version: "v2.0.550",
              });
              content = pdfData.text;
            } catch (pdfError) {
              console.error("PDF parsing error:", pdfError);
              continue;
            }
            break;

          case "application/msword":
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            const docBuffer = await fs.readFile(file.path);
            const docData = await mammoth.extractRawText({ buffer: docBuffer });
            content = docData.value;
            break;
        }

        const questions = parseQuizContent(content);
        if (questions.length > 0) {
          processedQuestions.push(...questions);
        }
      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
      }
    }

    if (processedQuestions.length > 0) {
      quiz.questions = processedQuestions;
      quiz.isProcessed = true;
      quiz.processingStatus = "completed";
    } else {
      quiz.processingStatus = "failed";
    }

    await quiz.save();

    // Clean up uploaded files
    for (const file of files) {
      await fs.unlink(file.path).catch(console.error);
    }
  } catch (error) {
    console.error("Error processing quiz file:", error);
    const quiz = await Quiz.findById(quizId);
    quiz.processingStatus = "failed";
    await quiz.save();
  }
};

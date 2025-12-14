import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, FileInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System Instruction to ensure high quality output in German
const SYSTEM_INSTRUCTION = `
Du bist ein erstklassiger, pädagogisch geschulter KI-Tutor. 
Deine Aufgabe ist es, Lernmaterialien aus hochgeladenen Dokumenten zu erstellen.
Die Sprache ist IMMER Deutsch.
Du arbeitest gründlich, nicht oberflächlich.
Du erstellst:
1. Eine übersichtliche Zusammenfassung in Stichpunkten (kein langer Fließtext).
2. Interaktive Flashcards (Begriff & Definition).
3. Ein anspruchsvolles Quiz mit 4 Fragen pro Kapitel.
`;

export const generateLearningContent = async (
  files: FileInput[],
  rawText: string,
  focus: string,
  exclude: string
): Promise<GeneratedContent> => {
  
  const model = "gemini-2.5-flash"; // Efficient and capable for text tasks

  // Prepare contents parts
  const parts: any[] = [];

  // Add text input
  if (rawText.trim()) {
    parts.push({ text: `Zusätzlicher Textinhalt:\n${rawText}` });
  }

  // Add files
  for (const file of files) {
    if (file.mimeType === 'application/pdf') {
       // Convert ArrayBuffer to Base64 for PDF
       const base64 = bufferToBase64(file.data as ArrayBuffer);
       parts.push({
         inlineData: {
           data: base64,
           mimeType: 'application/pdf'
         }
       });
    } else {
      // Text based or extracted content
      parts.push({ text: `Dokument: ${file.name}\nInhalt:\n${file.data}` });
    }
  }

  // Add User Instructions
  let instructions = "Analysiere die bereitgestellten Inhalte gründlich.";
  if (focus) instructions += `\nLegen den FOKUS besonders auf: ${focus}.`;
  if (exclude) instructions += `\nLASSE FOLGENDES WEG: ${exclude}.`;
  
  instructions += `
  Erstelle ein einziges JSON-Objekt, das alle folgenden Schlüssel enthält: 'summary', 'flashcards', 'quiz'.
  
  Strukturregeln:
  1. 'summary': { title: string, chapters: [{ title: string, topics: [{ title: string, content: string (Stichpunkte), studyQuestions: string[] }] }] }
     - WICHTIG: Der Content MUSS aus prägnanten Stichpunkten bestehen, KEIN Blocktext.
     - Nutze '• ' am Zeilenanfang für jeden Punkt.
     - Füge unter jedem Thema 2-3 Lernfragen ('studyQuestions') hinzu.
  
  2. 'flashcards': [{ term: string, definition: string }]
     - Erstelle ca. 10-20 wichtige Flashcards.
  
  3. 'quiz': { chapters: [{ title: string, questions: [{ text: string, options: string[], correctAnswerIndex: number, explanation: string, hint: string }] }] }
     - Erstelle GENAU 4 Fragen pro Kapitel.
     - 'explanation': Warum ist die Antwort richtig/falsch?
     - 'hint': Ein hilfreicher Tipp, der nicht die Lösung verrät.
  `;

  parts.push({ text: instructions });

  // Define the schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.STRING },
                      studyQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING }
          }
        }
      },
      quiz: {
        type: Type.OBJECT,
        properties: {
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswerIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      hint: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    required: ["summary", "flashcards", "quiz"]
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Keine Antwort von Gemini erhalten.");
    
    return JSON.parse(text) as GeneratedContent;
    
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
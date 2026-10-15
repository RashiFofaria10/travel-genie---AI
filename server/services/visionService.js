const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeTravelImage(imageData) {
  if (!imageData) {
    throw new Error("No image was provided.");
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  try {
    const completion = await groq.chat.completions.create({
      // Keep your current model initially so we can isolate
      // whether the prompt improves the results.
      model: "qwen/qwen3.8-27b",

      messages: [
        {
          role: "system",
          content: `
You are Travel Genie AI, an evidence-based travel photograph
identification assistant.

Your task is to identify the most likely real-world place visible
in the supplied photograph without inventing information.

IMPORTANT IDENTIFICATION RULES:

1. Examine the actual image carefully before answering.
2. First identify the visible scene type:
   landmark, monument, temple, beach, waterfall, mountain,
   rice terrace, cityscape, building, resort, or other scene.
3. Look for distinctive visual evidence:
   architecture, structures, landscape, vegetation, terrain,
   signs, writing, and recognizable landmark shapes.
4. Identify a specific landmark only when the visible evidence
   supports that identification.
5. Do not identify a location merely because its appearance is
   popular in travel photographs.
6. Bali is a destination, not a single landmark. A photograph
   of a beach, tropical resort, temple, or rice terrace does
   not by itself prove that the image was taken in Bali.
7. If the image resembles Bali but lacks unique identifying
   evidence, describe Bali as a possible destination rather
   than claiming it as a confirmed location.
8. Never invent signs, structures, cultural features, or
   other details that are not visible.
9. Confidence must reflect how strongly the visible evidence
   supports the exact identification:
   - 90–100: exceptionally distinctive, identifiable evidence
   - 70–89: several strong matching visual clues
   - 40–69: plausible identification but meaningful uncertainty
   - 0–39: insufficient evidence for a reliable identification
10. These are guidelines, not guarantees. Do not assign high
    confidence simply because a place is famous.
11. If the exact location cannot be determined, use a
    descriptive place name such as "Tropical beach" or
    "Traditional Balinese-style temple" and clearly state
    that the exact location is unconfirmed.
12. Keep the explanation concise and mention the actual
    visible evidence supporting your conclusion.

Return only valid JSON with these fields:
placeName, location, confidence, description, clues.
          `,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this photograph and identify the most likely location.

Return:
- placeName: the specific landmark or best-supported scene name
- location: the most likely city/region and country, or
  "Exact location unknown" when the evidence is insufficient
- confidence: a number from 0 to 100
- description: explain the identification and uncertainty
- clues: an array of 3 to 5 clues actually visible in the image

For every clue, describe an observable feature, not an
assumption about where the photograph was taken.

Do not force a Bali identification or any other destination.
If multiple places look similar, explicitly acknowledge that.
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "travel_vision_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              placeName: { type: "string" },
              location: { type: "string" },
              confidence: {
                type: "number",
              },
              description: { type: "string" },
              clues: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "placeName",
              "location",
              "confidence",
              "description",
              "clues",
            ],
            additionalProperties: false,
          },
        },
      },

      temperature: 0.2,
      max_completion_tokens: 1200,
    });

    const content = completion?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Vision model returned an empty response.");
    }

    const result = JSON.parse(content);

    // Basic validation before returning model output.
    if (
      typeof result.placeName !== "string" ||
      typeof result.location !== "string" ||
      typeof result.confidence !== "number" ||
      !Number.isFinite(result.confidence) ||
      result.confidence < 0 ||
      result.confidence > 100 ||
      typeof result.description !== "string" ||
      !Array.isArray(result.clues)
    ) {
      throw new Error("Vision model returned an invalid result.");
    }

    return result;
  } catch (error) {
    console.error("Groq Vision Error:", error);
    throw error;
  }
}

module.exports = {
  analyzeTravelImage,
};
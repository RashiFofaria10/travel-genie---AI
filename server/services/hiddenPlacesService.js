const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function findHiddenPlaces(destination) {
  if (!destination || !destination.trim()) {
    throw new Error("Destination is required.");
  }

  const cleanDestination = destination.trim().slice(0, 100);

  console.log(
    `🔎 Searching hidden places around ${cleanDestination}...`
  );

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are Travel Genie AI's Hidden Places Discovery Assistant.

Your job is to recommend lesser-known, real places around a travel destination.

Important rules:
- Recommend real places.
- Do not invent landmarks or attractions.
- Prefer places that are less crowded or commonly missed by tourists.
- Give practical information for travelers.
- Return ONLY valid JSON.
          `,
        },
        {
          role: "user",
          content: `
Find 5 lesser-known places around ${cleanDestination}.

For every place provide:

1. place name
2. location
3. why someone should visit
4. why tourists often miss it
5. best time to visit
6. time needed
7. estimated cost
8. how to reach it
9. one useful travel tip

Return exactly 5 places.

Return ONLY JSON in the requested structure.
          `,
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "hidden_places_result",
          strict: true,

          schema: {
            type: "object",

            properties: {
              destination: {
                type: "string",
              },

              intro: {
                type: "string",
              },

              places: {
                type: "array",

                items: {
                  type: "object",

                  properties: {
                    name: {
                      type: "string",
                    },

                    location: {
                      type: "string",
                    },

                    whyVisit: {
                      type: "string",
                    },

                    whyTouristsMissIt: {
                      type: "string",
                    },

                    bestTime: {
                      type: "string",
                    },

                    timeNeeded: {
                      type: "string",
                    },

                    estimatedCost: {
                      type: "string",
                    },

                    howToReach: {
                      type: "string",
                    },

                    travelTip: {
                      type: "string",
                    },
                  },

                  required: [
                    "name",
                    "location",
                    "whyVisit",
                    "whyTouristsMissIt",
                    "bestTime",
                    "timeNeeded",
                    "estimatedCost",
                    "howToReach",
                    "travelTip",
                  ],

                  additionalProperties: false,
                },
              },
            },

            required: [
              "destination",
              "intro",
              "places",
            ],

            additionalProperties: false,
          },
        },
      },

      temperature: 0.6,
      max_completion_tokens: 3000,
    });

    const content =
      completion?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "The AI did not return any hidden-place recommendations."
      );
    }

    console.log("🤖 Raw Hidden Places response received");

    let result;

    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error(
        "❌ Failed to parse AI response:",
        content
      );

      throw new Error(
        "The AI returned an invalid response."
      );
    }

    // Validate the main response
    if (
      !result ||
      typeof result !== "object" ||
      !Array.isArray(result.places)
    ) {
      console.error(
        "❌ Invalid Hidden Places response:",
        result
      );

      throw new Error(
        "The AI returned an invalid hidden places response."
      );
    }

    // Make sure we have usable place objects
    const validPlaces = result.places
      .filter(
        (place) =>
          place &&
          typeof place === "object" &&
          typeof place.name === "string"
      )
      .map((place) => ({
        name: place.name || "Unknown Place",
        location: place.location || "Location unavailable",
        whyVisit: place.whyVisit || "Information unavailable.",
        whyTouristsMissIt:
          place.whyTouristsMissIt ||
          "This place is less commonly included in standard tourist itineraries.",
        bestTime:
          place.bestTime || "Check local conditions before visiting.",
        timeNeeded:
          place.timeNeeded || "Varies",
        estimatedCost:
          place.estimatedCost || "Check locally",
        howToReach:
          place.howToReach || "Check local transport options.",
        travelTip:
          place.travelTip || "Check local information before visiting.",
      }));

    if (validPlaces.length === 0) {
      throw new Error(
        "No valid hidden places were returned."
      );
    }

    const finalResult = {
      destination:
        result.destination || cleanDestination,

      intro:
        result.intro ||
        `Here are some lesser-known places around ${cleanDestination}.`,

      places: validPlaces,
    };

    console.log(
      `✅ Hidden places generated: ${finalResult.places.length}`
    );

    return finalResult;
  } catch (error) {
    console.error(
      "❌ Hidden Places Groq Error:",
      error
    );

    throw error;
  }
}

module.exports = {
  findHiddenPlaces,
};
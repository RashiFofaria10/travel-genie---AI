const API = "http://localhost:5000/api/assistant";

export async function askAssistant(messages: any[]) {

  const response = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  });


  const data = await response.json();


  if (!data.success) {
    throw new Error(data.message);
  }


  return data.reply;
}
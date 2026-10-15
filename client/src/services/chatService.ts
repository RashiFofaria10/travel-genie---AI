import API from "./api";

export const chatWithAI = async (message: string) => {
  const response = await API.post("/chat", {
    message,
  });

  return response.data.reply;
};
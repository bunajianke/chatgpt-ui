export const STORAGE_KEY = {
  MODELS: "models",
  CURRENT_MODEL: "current_model",
  OPENAI_API_KEY: "openai_api_key",
};

export const MODELS = {
  "gpt-3.5": {
    name: "gpt-3.5-turbo",
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    total_tokens: 4096,
    max_tokens: 1000,
    temperature: 0.7,
    top_p: 1.0,
  },
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    total_tokens: 4096,
    max_tokens: 1000,
    temperature: 0.7,
    top_p: 1.0,
  },
  "gpt-4": {
    name: "gpt-4",
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    total_tokens: 8192,
    max_tokens: 2000,
    temperature: 0.7,
    top_p: 1.0,
  },
};

export const DEFAULT_MODEL_NAME = "gpt-3.5-turbo";

export const AVAIlABLEMODELS = ["gpt-3.5", "gpt-3.5-turbo", "gpt-4"];

export const GPT_VERSION = {
  "gpt-3.5": {
    name: "star",
    color: "#a8afb8",
    activeColor: "#02beff",
    title: 'GPT-3.5（普通版）',
    intro:
      "ChatGPT 3.5 是由OpenAI开发的一种大型语言模型，它基于GPT-3.5架构。它是经过大规模训练的，可以进行自然语言处理和对话生成任务。它能够理解和生成文本，从而与用户进行交互。",
  },
  "gpt-3.5-turbo": {
    name: "flash",
    color: "#a8afb8",
    activeColor: "#7fdf48",
    title: 'GPT-3.5（高级版）',
    intro:
      "ChatGPT 3.5 turbo 是由OpenAI开发的一种大型语言模型，它基于GPT-3.5架构。它是经过大规模训练的，可以进行自然语言处理和对话生成任务。它能够理解和生成文本，从而与用户进行交互。",
  },
  "gpt-4": {
    name: "crown",
    color: "#a8afb8",
    activeColor: "#f6b857",
    title: 'GPT-4（尊享版）',
    intro:
      "ChatGPT 4 是由OpenAI开发的一种大型语言模型，它基于GPT-3.5架构。它是经过大规模训练的，可以进行自然语言处理和对话生成任务。它能够理解和生成文本，从而与用户进行交互。",
  },
};

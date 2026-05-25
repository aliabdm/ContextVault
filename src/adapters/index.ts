import { registerAdapter } from "./base";
import { chatgptAdapter } from "./chatgpt";
import { claudeAdapter } from "./claude";
import { geminiAdapter } from "./gemini";
import { genericAdapter } from "./generic";

export function registerDefaultAdapters(): void {
  registerAdapter(chatgptAdapter);
  registerAdapter(claudeAdapter);
  registerAdapter(geminiAdapter);
  registerAdapter(genericAdapter);
}

export { chatgptAdapter, claudeAdapter, geminiAdapter, genericAdapter };

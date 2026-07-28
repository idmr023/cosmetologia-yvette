import { GoogleGenAI, createPartFromText, createPartFromFunctionCall, createPartFromFunctionResponse, Type } from "@google/genai";
import type { FunctionDeclaration, Content } from "@google/genai";
import { consultarStock } from "./tools/stockTools";
import { consultarCitas } from "./tools/appointmentTools";
import { consultarServicios } from "./tools/serviceTools";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `Eres el asistente inteligente de gestión interna para el Centro de Estética Yvette. 
Ayudas al equipo a revisar citas, disponibilidad de las colaboradoras (Elizabeth, Lourdes, Yvette), 
servicios e inventario de productos. Responde de forma clara, concisa, profesional y amigable en español.

Cuando te consulten por citas, puedes filtrar por fecha (formato YYYY-MM-DD, o texto relativo como "hoy", "mañana") 
y por nombre de colaboradora. Las colaboradoras son Elizabeth, Lourdes e Yvette.

Cuando te consulten por productos en inventario, puedes buscar por nombre del producto.
Siempre entrega información útil y accionable para el equipo.

Usa **doble asterisco** alrededor de palabras o frases importantes (como nombres, fechas, precios, cantidades) 
para resaltarlas. Por ejemplo: "Elizabeth tiene **3** citas el **15/07/2026**". NO uses listas numeradas 
con \`1.\` ni tablas, usa viñetas con guiones (-) para listar.`;

const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "consultarStock",
    description: "Obtiene la lista de productos del inventario. Puede filtrar por nombre del producto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        producto: {
          type: Type.STRING,
          description: "Nombre parcial o completo del producto a buscar (opcional). Si no se provee, devuelve todo el inventario.",
        },
      },
      required: [],
    },
  },
  {
    name: "consultarCitas",
    description: "Obtiene las citas agendadas. Puede filtrar por fecha (formato YYYY-MM-DD) y por nombre de colaboradora.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        fecha: {
          type: Type.STRING,
          description: "Fecha en formato YYYY-MM-DD para filtrar citas de ese día (opcional).",
        },
        colaboradora: {
          type: Type.STRING,
          description: "Nombre parcial o completo de la colaboradora (Elizabeth, Lourdes, Yvette) (opcional).",
        },
      },
      required: [],
    },
  },
  {
    name: "consultarServicios",
    description: "Obtiene la lista completa de servicios activos ofrecidos por el centro de estética.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
];

const toolImpl: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  consultarStock: async (args) => consultarStock(args.producto as string | undefined),
  consultarCitas: async (args) => consultarCitas(args.fecha as string | undefined, args.colaboradora as string | undefined),
  consultarServicios: async () => consultarServicios(),
};

let conversationHistory: Content[] = [];
const MAX_HISTORY = 6;

function trimHistory(): void {
  const pairs = conversationHistory.filter((m) => m.role === "user" || m.role === "model").length;
  while (pairs > MAX_HISTORY) {
    const firstUser = conversationHistory.findIndex((m) => m.role === "user");
    if (firstUser === -1) break;
    const firstModel = conversationHistory.findIndex((m) => m.role === "model");
    if (firstModel === -1) { conversationHistory.splice(firstUser, 1); break; }
    if (firstModel > firstUser) {
      conversationHistory.splice(firstUser, firstModel - firstUser + 1);
    } else {
      conversationHistory.splice(firstUser, 1);
    }
  }
}

export function resetConversation(): void {
  conversationHistory = [];
}

export async function processMessage(userMessage: string): Promise<string> {
  trimHistory();
  conversationHistory.push({ role: "user", parts: [createPartFromText(userMessage)] });

  for (let turn = 0; turn < 5; turn++) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: conversationHistory,
      config: {
        systemInstruction: { parts: [createPartFromText(SYSTEM_INSTRUCTION)] },
        tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      },
    });

    const text = response.text;
    const calls = response.functionCalls;

    if (calls && calls.length > 0) {
      const modelParts = calls.map((call) =>
        createPartFromFunctionCall(call.name!, call.args ?? {}),
      );
      conversationHistory.push({ role: "model", parts: modelParts });

      for (const call of calls) {
        const impl = toolImpl[call.name!];
        if (!impl) {
          conversationHistory.push({
            role: "function",
            parts: [
              createPartFromFunctionResponse(call.name!, call.name!, { error: `Función "${call.name}" no encontrada.` }),
            ],
          });
          continue;
        }
        try {
          const result = await impl(call.args ?? {});
          conversationHistory.push({
            role: "function",
            parts: [
              createPartFromFunctionResponse(call.name!, call.name!, { result }),
            ],
          });
        } catch (err) {
          conversationHistory.push({
            role: "function",
            parts: [
              createPartFromFunctionResponse(call.name!, call.name!, { error: (err as Error).message }),
            ],
          });
        }
      }
      continue;
    }

    if (text) {
      conversationHistory.push({ role: "model", parts: [createPartFromText(text)] });
      return text;
    }

    return "Lo siento, no pude procesar tu solicitud. Intenta de nuevo.";
  }

  return "Lo siento, la conversación fue demasiado larga. Por favor, reformula tu pregunta.";
}

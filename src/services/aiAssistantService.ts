import { APP_CONFIG } from '../config/app.config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

export interface AIResponse {
  message: ChatMessage;
}

const LOCAL_FAQ: Array<{ q: string; a: string; keywords: string[] }> = [
  { q: 'Comment réserver un espace ?', a: 'Allez sur la page Espaces, choisissez un type puis cliquez Réserver.', keywords: ['réserver', 'reservation', 'espace'] },
  { q: 'Quels sont les tarifs ?', a: 'Les tarifs dépendent du type d’espace et de la durée. Consultez la page Espaces.', keywords: ['tarif', 'prix'] },
  { q: 'Puis-je annuler ?', a: 'Oui, selon les règles d’annulation affichées lors de la réservation.', keywords: ['annuler', 'annulation'] },
];

const findLocalAnswer = (text: string): string | null => {
  const t = text.toLowerCase();
  for (const item of LOCAL_FAQ) {
    if (item.keywords.some(k => t.includes(k))) return item.a;
  }
  return null;
};

export class AIAssistantService {
  static async sendMessage(history: ChatMessage[], userText: string): Promise<AIResponse> {
    const endpoint = APP_CONFIG.aiAssistant.endpointUrl;
    const now = Date.now();

    // Fallback local
    const local = findLocalAnswer(userText);
    if (!endpoint || !endpoint.trim()) {
      return {
        message: {
          id: `m_${now}`,
          role: 'assistant',
          content: local || "Je n’ai pas trouvé d’information précise. Un conseiller vous répondra bientôt.",
          createdAt: now,
        },
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message: userText }),
      });
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      return data as AIResponse;
    } catch (e) {
      return {
        message: {
          id: `m_${now}`,
          role: 'assistant',
          content: local || "Je rencontre un problème pour répondre. Réessayez plus tard ou contactez le support.",
          createdAt: now,
        },
      };
    }
  }
}



import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class OllamaAssistantService {
  private conversationHistory = new Map<string, ChatMessage[]>();
  private readonly MAX_HISTORY = 20; // Aumentado para no perder el hilo del pedido

  constructor(private readonly productsService: ProductsService) {}

  async generateReply(input: {
    message: string;
    customerName?: string;
    customerPhone?: string;
  }) {
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const phone = input.customerPhone || 'unknown';

    const history = this.conversationHistory.get(phone) || [];
    const messages = await this.buildMessages(input, history);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1024,
          temperature: 0.2
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq responded with ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      const rawResponse = String(data.choices?.[0]?.message?.content || '').trim();
      
      console.log('=== RAW GROQ RESPONSE ===', rawResponse);

      const reply = rawResponse || this.getFallbackReply();

      this.updateHistory(phone, input.message, reply);

      return reply;
    } catch (error) {
      console.error('Groq assistant error:', error);
      return this.getFallbackReply();
    }
  }

  private async buildMessages(
    input: { message: string; customerName?: string; customerPhone?: string },
    history: ChatMessage[]
  ): Promise<ChatMessage[]> {
    const products = await this.productsService.findAll(undefined, true);
    const menuLines = products.map((product) => {
      const category = product.category?.name || 'Sin categoria';
      return `- ${product.name} (${category}): Q${Number(product.price).toFixed(2)}${product.description ? ` - ${product.description}` : ''}`;
    });

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `Eres "Cali", cajera virtual de "Al Cuadrado Cafe" en Huehuetenango, Guatemala.
Solo atiendes pedidos para consumir EN EL LOCAL. No hay delivery ni envíos.

═══════════════════════════
MENÚ OFICIAL (solo esto puedes vender):
═══════════════════════════
${menuLines.length > 0 ? menuLines.join('\n') : 'Sin productos disponibles.'}

═══════════════════════════
REGLAS (nunca las violes):
═══════════════════════════
1. NUNCA repitas lo que dijo el cliente.
2. NUNCA ofrezcas productos fuera del menú.
3. NUNCA cierres el pedido si faltan datos.
4. NO preguntes dirección. Pedidos solo en el local.
5. PAGO: solo "Efectivo" o "Tarjeta". Espera confirmación explícita.
6. Una sola pregunta por mensaje.
7. Entiende lenguaje informal guatemalteco: "hambur"=hamburguesa, "gaseo"=gaseosa, "papitas"=papas fritas, "efec"/"efectibo"=efectivo, "tarje"=tarjeta.
8. Si el cliente saluda, pídele su nombre primero. Cuando dé su nombre, responde con saludo personalizado Y muestra el menú completo con precios.
9. Usa el nombre del cliente en cada respuesta para personalizar.
10. Si el cliente pregunta por delivery, explica que solo atienden en el local.
11. MATEMÁTICA: multiplica correctamente. 3x Gaseosa Q15.00 = Q45.00.
12. Si el cliente pregunta "como va mi pedido" o similar, responde que su pedido está siendo procesado y que recibirá una notificación cuando esté listo.

═══════════════════════════
DATOS OBLIGATORIOS PARA CERRAR:
═══════════════════════════
✔ Nombre del cliente confirmado
✔ Productos confirmados con precio
✔ Método de pago confirmado (Efectivo o Tarjeta)

═══════════════════════════
FORMATO DE CIERRE OBLIGATORIO:
═══════════════════════════
Cuando tengas los 3 datos, responde EXACTAMENTE así,
la última línea SIEMPRE es [ORDEN_CERRADA] sola:

✅ Pedido confirmado para [nombre]:
- [N]x [Producto]: Q[precio unitario]
TOTAL: Q[suma correcta]
PAGO: [Efectivo/Tarjeta]
NOMBRE: [nombre del cliente]
¡Tu pedido estará listo en unos minutos!
[ORDEN_CERRADA]

═══════════════════════════
EJEMPLOS:
═══════════════════════════

EJEMPLO 1:
Cliente: hola
Cali: ¡Hola! Bienvenido a Al Cuadrado Cafe. ¿Me das tu nombre para el pedido?
Cliente: Juan
Cali: ¡Hola Juan! Aquí nuestro menú:
- Hamburguesa clásica: Q45.00
- Hamburguesa doble: Q65.00
- Pizza familiar: Q95.00
- Papas fritas: Q25.00
- Gaseosa: Q15.00
¿Qué se te antoja hoy?
Cliente: una hambur doble y papitas
Cali: 1x Hamburguesa doble (Q65.00) y 1x Papas fritas (Q25.00). Total Q90.00 Juan. ¿Pagas en Efectivo o Tarjeta?
Cliente: efec
Cali: ✅ Pedido confirmado para Juan:
- 1x Hamburguesa doble: Q65.00
- 1x Papas fritas: Q25.00
TOTAL: Q90.00
PAGO: Efectivo
NOMBRE: Juan
¡Tu pedido estará listo en unos minutos!
[ORDEN_CERRADA]

EJEMPLO 2:
Cliente: buenas
Cali: ¡Buenas! Bienvenido a Al Cuadrado Cafe. ¿Me das tu nombre?
Cliente: Maria Lopez
Cali: ¡Hola Maria! ¿Qué deseas ordenar?
Cliente: 2 gaseosas y una pizza
Cali: 2x Gaseosa (Q30.00) y 1x Pizza familiar (Q95.00). Total Q125.00 Maria. ¿Pagas en Efectivo o Tarjeta?
Cliente: tarjeta
Cali: ✅ Pedido confirmado para Maria Lopez:
- 2x Gaseosa: Q15.00
- 1x Pizza familiar: Q95.00
TOTAL: Q125.00
PAGO: Tarjeta
NOMBRE: Maria Lopez
¡Tu pedido estará listo en unos minutos!
[ORDEN_CERRADA]`.trim(),
    };

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.message,
    };

    return [
      systemPrompt,
      ...history,
      userMessage,
    ];
  }

  private updateHistory(phone: string, userMsg: string, assistantMsg: string) {
    const history = this.conversationHistory.get(phone) || [];
    
    history.push({ role: 'user', content: userMsg });
    history.push({ role: 'assistant', content: assistantMsg });

    if (history.length > this.MAX_HISTORY) {
      this.conversationHistory.set(phone, history.slice(-this.MAX_HISTORY));
    } else {
      this.conversationHistory.set(phone, history);
    }
  }

  private getFallbackReply() {
    return 'Lo siento, estoy teniendo problemas técnicos. Por favor, inténtalo de nuevo en un momento.';
  }
}

import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { OllamaAssistantService } from './ollama-assistant.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { OrderSource } from '../orders/entities/order.entity';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcodeTerminal from 'qrcode-terminal';
import * as QRCode from 'qrcode';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;
  private activeChats = new Map<string, any>();
  private qrCode: string | null = null;
  private connectionStatus: string = 'LOADING';
  private connectedPhone: string | null = null;

  constructor(
    private readonly clientsService: ClientsService,
    private readonly ollamaAssistantService: OllamaAssistantService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
      }),
      puppeteer: {
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
  }

  onModuleInit() {
    this.initializeWhatsApp();
  }

  private initializeWhatsApp() {
    this.client.on('qr', async (qr) => {
      console.log('[SISTEMA] Escanea este código QR para conectar WhatsApp:');
      qrcodeTerminal.generate(qr, { small: true });
      
      try {
        const qrBase64 = await QRCode.toDataURL(qr);
        this.qrCode = qrBase64.split(',')[1];
        this.connectionStatus = 'DISCONNECTED';
      } catch (err) {
        console.error('[ERROR] Error al generar QR base64:', err);
      }
    });

    this.client.on('ready', () => {
      console.log('[SISTEMA] ¡WhatsApp Web conectado exitosamente!');
      const info = this.client.info;
      this.connectedPhone = info?.wid?.user || null;
      this.connectionStatus = 'CONNECTED';
      this.qrCode = null;
    });

    this.client.on('disconnected', () => {
      console.log('[SISTEMA] WhatsApp desconectado');
      this.connectionStatus = 'DISCONNECTED';
      this.connectedPhone = null;
    });

    this.client.on('message', async (message) => {
      try {
        await this.handleIncomingMessage(message);
      } catch (error) {
        console.error('[ERROR] Error al procesar mensaje de WhatsApp:', error);
      }
    });

    this.client.initialize();
  }

  getStatus() {
    return {
      status: this.connectionStatus,
      phone: this.connectedPhone,
      qr: this.qrCode
    };
  }

  async disconnect() {
    try {
      await this.client.logout();
      this.connectionStatus = 'DISCONNECTED';
      this.connectedPhone = null;
      this.qrCode = null;
      return { success: true, message: 'Desconectado' };
    } catch (error) {
      console.error('[ERROR] Al desconectar WhatsApp:', error);
      return { success: false, message: 'Error al desconectar' };
    }
  }

  private async handleIncomingMessage(msg: any) {
    if (msg.fromMe) return;

    const contact = await msg.getContact();
    const chat = await msg.getChat();
    const chatId = contact.id._serialized || msg.from;
    const phone = contact.number || msg.from.replace('@lid', '').replace('@c.us', '');

    this.activeChats.set(chatId, chat);

    const name = contact.pushname || contact.name || 'Cliente de WhatsApp';

    if (!msg.body || msg.from.includes('@g.us')) return; // Ignorar grupos o mensajes vacíos

    console.log(`[MENSAJE] De ${name} (${phone}): ${msg.body}`);

    // Registrar/Actualizar cliente
    const client = await this.clientsService.upsertClient({
      phone: phone || 'sin-numero',
      name,
    });

    // Generar respuesta con Ollama
    const rawReply = await this.ollamaAssistantService.generateReply({
      message: msg.body,
      customerName: client?.name || name,
      customerPhone: phone,
    });

    console.log(`[Ollama Response for ${phone}]:`, rawReply);

    // 2. Verificar si incluye la etiqueta (sin importar puntos o espacios)
    const isOrderClosed = /\[?ORDEN[_\s]CERRADA\]?/i.test(rawReply);

    // 3. Limpiar la etiqueta para que no la vea el cliente
    const cleanReply = rawReply.replace(/\[?ORDEN[_\s]CERRADA\]?/gi, '').replace(/\.$/, '').trim();

    // 4. Guardar en base de datos SI se activó el disparador
    if (isOrderClosed) {
      console.log('[SISTEMA] Disparador [ORDEN_CERRADA] detectado. Guardando en DB...');
      
      const addressMatch = rawReply.match(/(?:DIRECCIÓN|LUGAR):\s*(.+)/i);
      const deliveryAddress = addressMatch?.[1]?.trim() || 'En cafetería';

      const paymentMatch = rawReply.match(/PAGO:\s*(Efectivo|Tarjeta)/i);
      const paymentMethod = paymentMatch?.[1]?.trim() || 'Efectivo';

      const nombreMatch = rawReply.match(/NOMBRE:\s*(.+)/i);
      const customerName = nombreMatch?.[1]?.trim() || null;

      await this.processAutomaticOrder(client, rawReply, deliveryAddress, paymentMethod, customerName ?? undefined, phone, chatId);
    }

    // 5. Enviar el mensaje limpio por WhatsApp
    await msg.reply(cleanReply);
  }

  async handleWebChat(data: { telefono: string; nombre: string; mensaje: string }) {
    if (!data.telefono) {
      throw new Error("El número de teléfono es obligatorio.");
    }

    const phone = this.normalizePhone(data.telefono) || 'sin-numero';
    const client = await this.clientsService.upsertClient({
      phone,
      name: data.nombre,
    });

    const reply = await this.ollamaAssistantService.generateReply({
      message: data.mensaje,
      customerName: client?.name || data.nombre,
      customerPhone: data.telefono,
    });

    console.log(`[Web Chat Response for ${data.telefono}]:`, reply);

    const cleanReply = reply.replace(/\[?ORDEN[_\s]CERRADA\]?/gi, '').replace(/\.$/, '').trim();

    if (this.shouldCreateOrder(reply)) {
      const addressMatch = reply.match(/(?:DIRECCIÓN|LUGAR):\s*(.+)/i);
      const deliveryAddress = addressMatch?.[1]?.trim() || 'En cafetería';

      const paymentMatch = reply.match(/PAGO:\s*(Efectivo|Tarjeta)/i);
      const paymentMethod = paymentMatch?.[1]?.trim() || 'Efectivo';

      const nombreMatch = reply.match(/NOMBRE:\s*(.+)/i);
      const customerName = nombreMatch?.[1]?.trim() || data.nombre;

      const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
      await this.processAutomaticOrder(client, reply, deliveryAddress, paymentMethod, customerName ?? undefined, phone, chatId);
    }

    return {
      status: 'success',
      reply: cleanReply,
    };
  }

  private shouldCreateOrder(reply: string): boolean {
    return /\[?ORDEN[_\s]CERRADA\]?/i.test(reply);
  }

  private async processAutomaticOrder(client: any, aiReply: string, address?: string, paymentMethod?: string, customerName?: string, phoneNumber?: string, chatId?: string) {
    try {
      const allProducts = await this.productsService.findAll(undefined, true);
      const items: any[] = [];

      // Extraer productos del ticket: "- 2x Hamburguesa doble: Q65.00"
      const productLines = aiReply.match(/- (\d+)x (.+?):\s*Q[\d.]+/g) || [];

      for (const line of productLines) {
        const lineMatch = line.match(/- (\d+)x (.+?):\s*Q[\d.]+/);
        if (lineMatch) {
          const quantity = parseInt(lineMatch[1], 10);
          const productName = lineMatch[2].trim();

          const product = allProducts.find(p => 
            p.name.toLowerCase().includes(productName.toLowerCase())
          );

          if (product) {
            items.push({
              product_id: product.id,
              quantity: quantity
            });
          } else {
            console.log(`[SISTEMA] Producto no encontrado en DB: ${productName}`);
          }
        }
      }

      if (items.length > 0) {
        const order = await this.ordersService.create({
          client_id: client.id,
          address: address || client.address || 'En cafetería',
          items,
          notes: `Pedido WhatsApp - Cliente: ${customerName} - Tel: ${phoneNumber} - Pago: ${paymentMethod}`
        }, OrderSource.WHATSAPP);
        
        console.log('[SISTEMA] Pedido insertado en DB para el cliente:', client.id);

        // Actualizar nombre del cliente si el bot lo capturó
        if (customerName) {
          await this.clientsService.update(client.id, { name: customerName });
        }

        if (chatId && order) {
          const orderNumber = String(order.id).padStart(4, '0');
          try {
            await this.sendNotification(
              chatId,
              `🎟️ Tu número de orden es *#${orderNumber}*. ¡Muéstralo en caja cuando pases a recoger!`
            );
            console.log(`[SISTEMA] Número de orden #${orderNumber} enviado a ${chatId}`);
          } catch (notificationError) {
            console.error(`[SISTEMA] Error al enviar número de orden a ${chatId}:`, notificationError);
          }
        }
      }
    } catch (error) {
      console.error('[SISTEMA] Error al crear pedido automático:', error);
    }
  }

  async sendNotification(phone: string, message: string) {
    try {
      const chat = this.activeChats.get(phone) 
        || this.activeChats.get(phone + '@c.us')
        || this.activeChats.get(phone + '@lid');

      if (chat) {
        await chat.sendMessage(message);
        console.log(`[SISTEMA] Notificación enviada vía chat activo a ${phone}`);
      } else {
        await this.client.sendMessage(phone, message);
        console.log(`[SISTEMA] Notificación enviada vía cliente a ${phone}`);
      }
    } catch (error) {
      console.error(`[SISTEMA] Error al enviar notificación a ${phone}:`, error);
    }
  }

  private normalizePhone(phone?: string) {
    if (!phone) return undefined;
    // whatsapp-web.js devuelve números con @c.us o @g.us
    return String(phone).split('@')[0].replace(/[^\d]/g, '');
  }

  // Métodos antiguos de Webhook de Meta que ya no son necesarios pero se mantienen por compatibilidad si el controller aún los llama
  async handleWebhook(data: any) {
    return { status: 'deprecated', message: 'Use WhatsApp Web client instead' };
  }

  verifyWebhook(query: any) {
    return 'Forbidden';
  }
}

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir frontend
app.use(express.static(path.join(__dirname, 'GDA-Sistema')));

// Credenciales Meta Graph API
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAMrmD0coscBRKKbzAGQOMnDTwgIbcovb1yHd0pd62WU4HIg4gSzxKUZANwntCLXXpslL9bYLKSCw84DqZCY1N07vLKCywdZAenqFuy5V0f9B6T20EZCAXtuIgJaZCYsx3FiF4TT9ypZBgK8rBg83GivwWapWZC24BfXnJW36XeOVJPPvgRs399sdZAXPDO4ZBZBXewjPXcRA69TDiP8xmeNGltXQ3PlBhkM1mSvS7w57ZAaXy2nd36R75VCR5Fts5upfNMWy0hSipZAAN0qYkGbBPNgsAZDZD';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'GDA_VERIFY_TOKEN_2024';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1037823872748782';

// Estado de la conversacion (en memoria, para flujo de bot)
const userStates = {};

// Transformar HTML a formato de WhatsApp text (ej. <b> a *)
function formatMsg(htmlString) {
  let parsed = htmlString.replace(/<br\s*\/?>/gi, '\n');
  parsed = parsed.replace(/<\/?b>/gi, '*');
  parsed = parsed.replace(/<\/?i>/gi, '_');
  return parsed;
}

// Lógica original de chatbot.js migrada a Backend
function getBotResponse(msg, phone) {
  const m = msg.toLowerCase().trim();
  const state = userStates[phone]?.state || 'init';

  if (/^(hola|buenos|buenas|hey|hi|saludos)/.test(m)) {
    userStates[phone] = { state: 'greeted' };
    return formatMsg('👋 Hola! Bienvenido/a a *GDA Repuestos y Servicios*.\n\nSoy tu asistente virtual. ¿En qué puedo ayudarte hoy?\n\n1. 🔧 Servicios\n2. 🔩 Repuestos\n3. 📅 Agendar turno\n4. 💰 Presupuesto\n5. 📍 Horarios y ubicación');
  }

  if (/servicio|mecanica|trabajos|reparaci|1/.test(m)) {
    return formatMsg('🔧 *Nuestros servicios disponibles:*\n- Mecánica General\n- Cambio de Aceite\n- Sistema Eléctrico\n- Aire Acondicionado\n- Frenos y Suspensión\n- Diagnóstico OBD\n- Transmisión');
  }

  if (/presupuesto|precio|costo|cuanto|4/.test(m)) {
    userStates[phone] = { state: 'budget' };
    return formatMsg('💰 Para prepararte un presupuesto necesito:\n\n*1.* Marca y modelo del vehículo\n*2.* Año\n*3.* Servicio necesario\n\nEj: _Toyota Corolla 2018, cambio de frenos_');
  }

  if (state === 'budget' && m.length > 8) {
    userStates[phone] = { state: 'named' };
    return formatMsg(`✅ Consulta recibida: *"${msg}"*\n\nUn técnico te contactará pronto.\n\n📞 +595 971 000-000`);
  }

  if (/turno|cita|agendar|reservar|3/.test(m)) {
    userStates[phone] = { state: 'appt' };
    return formatMsg('📅 Para agendar indícame:\n\n*• Nombre completo*\n*• Vehículo (marca, modelo, año)*\n*• Servicio*\n*• Día y horario preferido*\n\nO llamá al *+595 971 000-000*');
  }

  if (state === 'appt' && m.length > 8) {
    userStates[phone] = { state: 'named' };
    return formatMsg(`🎉 Turno registrado! Resumen: *"${msg}"*\n\nTe confirmaremos pronto. Llega 15 min antes. ✅`);
  }

  if (/repuesto|pieza|parte|filtro|2/.test(m)) {
    return formatMsg('🔩 Tenemos amplio stock de repuestos:\n\n*• Filtros:* aceite, aire, combustible\n*• Frenos:* pastillas, discos, tambores\n*• Motor:* correas, tensores, bujías\n*• Suspensión:* amortiguadores, rótulas\n*• Eléctrico:* baterías, alternadores\n\n¿Necesitas algo específico? Contame la marca y modelo 🚗');
  }

  if (/horario|cuando abren|atienden|ubicacion|direccion|donde|5/.test(m)) {
    return formatMsg('📍 *Ubicación:* Av. Principal 1234, Presidente Franco, Alto Paraguay\n\n🕐 *Horarios de Atención*\n*Lunes a Viernes:* 8:00 - 18:00 hs\n*Sábados:* 8:00 - 13:00 hs\n*Domingos:* Cerrado');
  }

  if (/telefono|contacto|whatsapp/.test(m)) {
    return formatMsg('📞 *Contacto*\nTeléfono: +595 971 000-000\nWhatsApp: +595 971 000-000');
  }

  if (/gracias/.test(m)) {
    return formatMsg(`🙏 De nada! Fue un placer. Que tengas un excelente día! 🌟`);
  }

  return formatMsg('Puedo ayudarte con:\n1. 🔧 Servicios\n2. 🔩 Repuestos\n3. 📅 Agendar turno\n4. 💰 Solicitar presupuesto\n5. 📍 Horarios y ubicación');
}

// Enviar mensaje por Meta Graph API
async function sendWhatsAppMessage(to, text) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text },
      },
    });
  } catch (error) {
    console.error("Error enviando WhatsApp:", error?.response?.data || error.message);
  }
}

// 1. Endpoint /webhook GET para validación en Meta Developers
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    // Verificar si modo y token match con lo que damos en Railway / Meta
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    // health check genérico
    res.json({ status: 'ok', service: 'GDA-WhatsApp-API', timestamp: new Date().toISOString() });
  }
});

// 2. Endpoint /webhook POST para recibir eventos y mensajes
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      // Capturar número y texto del usuario
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;

      let msg_body = "";
      if (message.type === "text") {
        msg_body = message.text.body;
      }

      console.log(`💬 Mensaje recibido de ${from}: ${msg_body}`);

      // Usar lógica de chatbot.js migrada para decidir respuesta
      const replyText = getBotResponse(msg_body, from);

      // Disparar envío via Meta Graph API
      await sendWhatsAppMessage(from, replyText);
    }
    // Meta requiere 200 OK rapido para no re-enviar eventos
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Redireccionar raíz a index.html del frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'GDA-Sistema', 'index.html'));
});

// El puerto viene de Railway via process.env.PORT o usa 3000 local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🎯 GDA-Sistema con WhatsApp (Meta API) iniciado`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`✨ Webhook listo para uso en /webhook\n`);
});

export default app;

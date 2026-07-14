export function waLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function bookingMessage(params: {
  clientName: string;
  serviceName: string;
  colaboradorName: string;
  date: string;
  time: string;
  modality: string;
  total: string;
}): string {
  return (
    `🧖‍♀️ *Centro de Estética Yvette*\n\n` +
    `¡Hola ${params.clientName}! Tu cita fue reservada:\n\n` +
    `📋 *Servicio:* ${params.serviceName}\n` +
    `👩‍🎨 *Especialista:* ${params.colaboradorName}\n` +
    `📅 *Fecha:* ${params.date}\n` +
    `⏰ *Hora:* ${params.time}\n` +
    `📍 *Modalidad:* ${params.modality}\n` +
    `💰 *Total:* ${params.total}\n\n` +
    `📍 Dirección: Cercado de Lima\n` +
    `💳 Pago en efectivo, Yape o Plin al momento de la cita.\n\n` +
    `¡Te esperamos! 💛`
  );
}

export function reminderMessage(params: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
}): string {
  return (
    `🧖‍♀️ *Centro de Estética Yvette*\n\n` +
    `Recordatorio: ${params.clientName}, tienes una cita mañana:\n\n` +
    `📋 *${params.serviceName}*\n` +
    `📅 ${params.date} a las ${params.time}\n\n` +
    `Confirma o reagenda al WhatsApp. ¡Te esperamos! 💛`
  );
}

export function statusChangeMessage(params: {
  clientName: string;
  serviceName: string;
  status: string;
}): string {
  return (
    `🧖‍♀️ *Centro de Estética Yvette*\n\n` +
    `${params.clientName}, tu cita de *${params.serviceName}* ` +
    `cambió a: *${params.status}*.\n\n` +
    `Cualquier consulta, responde este mensaje. 💛`
  );
}

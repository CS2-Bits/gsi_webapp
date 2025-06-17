"use server";

import { transporter } from "@/lib/nodemailer";
import { redis } from "@/lib/redis";
import { ActionResponse } from "@/types/action-response";
import { getCurrentUser } from "../user/get-current-user";
import { ContactFormData, contactFormSchema } from "@/schemas/contact.schema";

export async function submitContactFormAction(
  data: ContactFormData
): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error_message: "error.authentication_needed" };
    }

    if (user.email == null) {
      return { success: false, error_message: "error.user_email_not_found" };
    }

    const validatedData = contactFormSchema.parse(data);

    // Verificar rate limiting no Redis
    const emailKey = `contact:${user.email}`;
    const lastSent = await redis.get(emailKey);

    if (lastSent) {
      const timeDiff = Date.now() - Number.parseInt(lastSent);
      const fiveMinutes = 60 * 5 * 1000;

      if (timeDiff < fiveMinutes) {
        return {
          success: false,
          error_message: "error.rate_limit_exceeded",
        };
      }
    }

    const emailContent = `
      Nova solicitação de contato: \n
       
      Nome: ${validatedData.name} \n
      Plataforma: ${validatedData.platform} \n
      User ID: ${user.id} \n
      Steam ID: ${user.steam_id} \n
      Email: ${user.email} \n
      
      Data: ${new Date().toLocaleString("pt-BR")} \n
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "felipe@cs2bits.com",
      subject: "Nova solicitação de demostração CS2Bits",
      text: emailContent,
      html: emailContent,
    });

    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Solicitação de Demonstração Recebida!</h2>
      <p>Olá, ${validatedData.name}!</p>
      <p>
        Recebemos sua solicitação de demonstração para a plataforma <strong>${validatedData.platform}</strong>.<br>
        Em breve entraremos em contato pelo e-mail <strong>${user.email}</strong>.
      </p>
      <p>Obrigado pelo seu interesse no CS2Bits!</p>
      <hr>
      <small>Esta é uma mensagem automática. Por favor, não responda.</small>
      </div>
    `;

    const confirmationText = `
      Solicitação de Demonstração Recebida!

      Olá, ${validatedData.name}!

      Recebemos sua solicitação de demonstração para a plataforma ${validatedData.platform}.
      Em breve entraremos em contato pelo e-mail ${user.email}.

      Obrigado pelo seu interesse no CS2Bits!

      Esta é uma mensagem automática. Por favor, não responda.
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email.toLowerCase(),
      subject: "CS2 Bits solicitação recebida com sucesso",
      text: confirmationText,
      html: confirmationHtml,
    });

    await redis.setex(emailKey, 3600, Date.now().toString());

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("Erro ao processar formulário:", error);

    return {
      success: false,
      error_message: "error.internal_error",
    };
  }
}

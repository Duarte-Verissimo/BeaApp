"use server";

import nodemailer from 'nodemailer';
import { generateEarningsReportHtml } from './email-templates';

export async function sendEarningsReport(formData: {
  companyName: string;
  contractPercentage: string;
  reportEmail: string;
  treatments: { type: string; value: string }[];
  customClinicName?: string;
}) {
  try {
    // Calculate totals
    const total = formData.treatments.reduce((sum, treatment) => {
      const value = parseFloat(treatment.value) || 0;
      return sum + value;
    }, 0);

    const percentage = parseFloat(formData.contractPercentage) || 0;
    const netEarnings = (total * percentage) / 100;

    // Determine clinic name
    const clinicName =
      formData.companyName === "Outro"
        ? formData.customClinicName || "Personalizado"
        : formData.companyName || "Não especificado";

    // Create HTML email content
    const htmlContent = generateEarningsReportHtml({
      clinicName,
      percentage,
      treatments: formData.treatments,
      total,
      netEarnings
    });

    // Send email using Nodemailer (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Bea App" <${process.env.GMAIL_USER}>`,
      to: formData.reportEmail,
      subject: "Relatório de Ganhos Diários - Dentista",
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      return { success: true, data: info };
    } catch (error: unknown) {
      console.error("Error sending email:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send email";
      return { 
        success: false, 
        error: errorMessage
      };
    }
  } catch (error: unknown) {
    console.error("Error in sendEarningsReport:", error);
    return { success: false, error: "Failed to send email" };
  }
}


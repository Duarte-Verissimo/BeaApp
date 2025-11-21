"use server";

import nodemailer from 'nodemailer';

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
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Ganhos Diários</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              border: 2px solid #000;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #000;
            }
            .treatments-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .treatments-table th,
            .treatments-table td {
              border: 1px solid #000;
              padding: 10px;
              text-align: left;
            }
            .treatments-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
            }
            .highlight {
              font-size: 18px;
              font-weight: bold;
              color: #000;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Ganhos Diários</h1>
            <p>Calculadora de Rendimento Líquido - Dentista</p>
          </div>
          
          <div class="section">
            <div class="section-title">Informações da Clínica</div>
            <p><strong>Clínica:</strong> ${clinicName}</p>
            <p><strong>Percentagem do Contrato:</strong> ${percentage}%</p>
          </div>
          
          <div class="section">
            <div class="section-title">Tratamentos Realizados</div>
            <table class="treatments-table">
              <thead>
                <tr>
                  <th>Tipo de Tratamento</th>
                  <th>Valor (€)</th>
                </tr>
              </thead>
              <tbody>
                ${formData.treatments
                  .map(
                    (treatment) => `
                  <tr>
                    <td>${treatment.type || "Tratamento sem nome"}</td>
                    <td>${
                      parseFloat(treatment.value)
                        ? parseFloat(treatment.value).toFixed(2)
                        : "0.00"
                    }€</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td>Total Bruto:</td>
                  <td>${total.toFixed(2)}€</td>
                </tr>
                <tr class="total-row">
                  <td>Ganhos Líquidos:</td>
                  <td class="highlight">${netEarnings.toFixed(2)}€</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <p>Este relatório foi gerado automaticamente pela Calculadora de Rendimento Líquido.</p>
          </div>
        </body>
      </html>
    `;

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


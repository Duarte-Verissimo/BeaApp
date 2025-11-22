export function generateEarningsReportHtml(data: {
  clinicName: string;
  percentage: number;
  treatments: { type: string; value: string }[];
  total: number;
  netEarnings: number;
}) {
  const { clinicName, percentage, treatments, total, netEarnings } = data;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Ganhos - BeaApp</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #000000;
            background-color: #f4f4f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FAEEE7;
            border: 3px solid #000000;
            box-shadow: 8px 8px 0px 0px #000000;
            padding: 0;
            overflow: hidden;
          }
          .header {
            background-color: #FF8BA7;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #000000;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -1px;
          }
          .content {
            padding: 30px;
          }
          .card {
            background-color: #ffffff;
            border: 2px solid #000000;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 4px 4px 0px 0px #000000;
          }
          .card-title {
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 15px;
            text-transform: uppercase;
            border-bottom: 2px solid #000000;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .info-label {
            font-weight: 600;
          }
          .table-container {
            width: 100%;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          th {
            text-align: left;
            padding: 8px;
            border-bottom: 2px solid #000000;
            font-weight: 800;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e5e5e5;
          }
          .total-section {
            background-color: #FF8BA7;
            color: #ffffff;
            padding: 20px;
            margin-top: 20px;
            border: 2px solid #000000;
            box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.2);
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            margin-bottom: 5px;
          }
          .net-earnings {
            font-size: 24px;
            font-weight: 900;
            border-top: 1px solid #555;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            border-top: 3px solid #000000;
            background-color: #ffffff;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BeaApp.</h1>
          </div>
          
          <div class="content">
            <div class="card">
              <div class="card-title">Resumo da Clínica</div>
              <div class="info-row">
                <span class="info-label">Clínica:</span>
                <span>${clinicName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Contrato:</span>
                <span>${percentage}%</span>
              </div>
            </div>

            <div class="card">
              <div class="card-title">Tratamentos</div>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th style="text-align: right;">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${treatments
                      .map(
                        (t) => `
                      <tr>
                        <td>${t.type || "Tratamento"}</td>
                        <td style="text-align: right;">${
                          parseFloat(t.value)
                            ? parseFloat(t.value).toFixed(2)
                            : "0.00"
                        }€</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span>Total Bruto:</span>
                <span>${total.toFixed(2)}€</span>
              </div>
              <div class="total-row net-earnings">
                <span>Líquido a Receber:</span>
                <span>${netEarnings.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <div class="footer">
            BeaApp - Gestão Inteligente para Dentistas
          </div>
        </div>
      </body>
    </html>
  `;
}



interface PrintWeightedProductProps {
  criteria: any[];
  vectorS: any[];
  finalResults: any[];
  totalBobot: number;
  normalizedWeights: Record<string, number>;
}

export const printWeightedProduct = ({
  criteria,
  vectorS,
  finalResults,
  totalBobot,
  normalizedWeights,
}: PrintWeightedProductProps) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this website.");
    return;
  }

 
  const projectName = document.title || "SPK Weighted Product";

 
  const printStyles = `
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        padding: 20px;
        color: #333;
      }
      .print-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
      h1 {
        font-size: 18px;
        margin: 0 0 5px 0;
      }
      h2 {
        font-size: 16px;
        margin: 20px 0 10px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #eee;
      }
      .subtitle {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
      .date {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
        font-weight: 600;
      }
      tr.winner {
        background-color: #f0fff4;
      }
      .badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 5px;
      }
      .badge-green {
        background-color: #d1fae5;
        color: #047857;
      }
      .badge-red {
        background-color: #fee2e2;
        color: #b91c1c;
      }
      .calculation-box {
        background-color: #f9fafb;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #eee;
        margin-top: 20px;
      }
      .formula {
        font-family: monospace;
        font-weight: 600;
        margin: 10px 0;
      }
      ul {
        padding-left: 20px;
      }
      li {
        margin-bottom: 5px;
      }
      .text-right {
        text-align: right;
      }
      .font-bold {
        font-weight: 600;
      }
      .winner-card {
        border: 1px solid #d1fae5;
        background-color: #ecfdf5;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
      }
      .winner-title {
        color: #047857;
        font-weight: 600;
        margin: 0 0 10px 0;
      }
      @media print {
        body {
          padding: 0;
          margin: 0;
        }
      }
    </style>
  `;


  let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hasil Perhitungan Weighted Product</title>
      ${printStyles}
    </head>
    <body>
      <div class="print-header">
        <h1>Hasil Perhitungan Weighted Product</h1>
        <p class="subtitle">Sistem Pendukung Keputusan - ${projectName}</p>
        <p class="date">Tanggal: ${new Date().toLocaleDateString()}</p>
      </div>
  `;


  if (finalResults.length > 0) {
    const winner = finalResults[0];
    printContent += `
      <div class="winner-card">
        <h3 class="winner-title">Alternatif Terbaik</h3>
        <p class="font-bold">${winner.kode} - ${winner.nama}</p>
        <p>Ranking #1 dengan nilai ${winner.vectorV.toFixed(4)}</p>
      </div>
    `;
  }


  printContent += `
    <h2>Hasil Perankingan Akhir</h2>
    <table>
      <thead>
        <tr>
          <th>Ranking</th>
          <th>Kode</th>
          <th>Nama Alternatif</th>
          <th class="text-right">Nilai Vector V</th>
        </tr>
      </thead>
      <tbody>
  `;

  finalResults.forEach((result) => {
    printContent += `
      <tr ${result.rank === 1 ? 'class="winner"' : ''}>
        <td>${result.rank}</td>
        <td>${result.kode}</td>
        <td>${result.nama} ${
      result.rank === 1
        ? '<span class="badge badge-green">Terbaik</span>'
        : ""
    }</td>
        <td class="text-right">${result.vectorV.toFixed(4)}</td>
      </tr>
    `;
  });

  printContent += `
      </tbody>
    </table>
  `;


  printContent += `
    <h2>Data Kriteria dan Bobot</h2>
    <table>
      <thead>
        <tr>
          <th>Kode</th>
          <th>Kriteria</th>
          <th>Jenis</th>
          <th>Bobot Asli</th>
          <th class="text-right">Bobot Normalisasi</th>
        </tr>
      </thead>
      <tbody>
  `;

  criteria.forEach((crit) => {
    printContent += `
      <tr>
        <td>${crit.kode}</td>
        <td>${crit.nama_kriteria}</td>
        <td>${
          crit.keterangan.toLowerCase() === "benefit"
            ? '<span class="badge badge-green">Benefit</span>'
            : '<span class="badge badge-red">Cost</span>'
        }</td>
        <td>${crit.bobot}</td>
        <td class="text-right">${normalizedWeights[crit.id].toFixed(4)}</td>
      </tr>
    `;
  });

  printContent += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="font-bold">Total</td>
          <td>${totalBobot}</td>
          <td class="text-right">1.0000</td>
        </tr>
      </tfoot>
    </table>
  `;


  const totalVectorS = vectorS.reduce((acc, curr) => acc + curr.vectorS, 0);
  printContent += `
    <h2>Perhitungan Vector S</h2>
    <table>
      <thead>
        <tr>
          <th>Kode</th>
          <th>Alternatif</th>
          <th class="text-right">Nilai Vector S</th>
        </tr>
      </thead>
      <tbody>
  `;

  vectorS.forEach((vs) => {
    printContent += `
      <tr>
        <td>${vs.kode}</td>
        <td>${vs.nama}</td>
        <td class="text-right">${vs.vectorS.toFixed(4)}</td>
      </tr>
    `;
  });

  printContent += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" class="font-bold">Total</td>
          <td class="text-right">${totalVectorS.toFixed(4)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="calculation-box">
      <h3>Rumus Perhitungan Vector V</h3>
      <p>Vector V dihitung dengan membagi nilai Vector S alternatif dengan total nilai Vector S semua alternatif:</p>
      <p class="formula">Vi = Si / ∑Si</p>
      <ul>
        <li>Vi = Nilai vector V alternatif ke-i</li>
        <li>Si = Nilai vector S alternatif ke-i</li>
        <li>∑Si = Total nilai vector S semua alternatif (${totalVectorS.toFixed(
          4
        )})</li>
      </ul>
    </div>
  `;

  printContent += `
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
  };
};

export default printWeightedProduct;
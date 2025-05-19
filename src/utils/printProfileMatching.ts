interface PrintProfileMatchingProps {
  alternatifs: any[];
  kriterias: any[];
  project: any;
  calculateScoreDetail: (alt: any) => { totalScore: string; details: any[] };
}

export const printProfileMatching = ({
  alternatifs,

  project,
  calculateScoreDetail,
}: PrintProfileMatchingProps) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this website.");
    return;
  }


  const projectName = project?.nama || "SPK Profile Matching";

  
  const sortedAlternatifs = [...alternatifs]
    .map((alt) => {
      const { totalScore } = calculateScoreDetail(alt);
      return { ...alt, totalScore: parseFloat(totalScore) };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

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
        font-size: 13px;
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
      .badge-blue {
        background-color: #dbeafe;
        color: #1e40af;
      }
      .badge-purple {
        background-color: #ede9fe;
        color: #6d28d9;
      }
      .calculation-box {
        background-color: #f9fafb;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #eee;
        margin: 20px 0;
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
      .text-center {
        text-align: center;
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
      .factor-boxes {
        display: flex;
        gap: 20px;
        margin: 20px 0;
      }
      .factor-box {
        flex: 1;
        padding: 15px;
        border-radius: 5px;
      }
      .core-factor {
        background-color: #dbeafe;
        border: 1px solid #bfdbfe;
      }
      .secondary-factor {
        background-color: #ede9fe;
        border: 1px solid #ddd6fe;
      }
      .factor-title {
        margin: 0 0 10px 0;
        font-weight: 600;
      }
      .factor-value {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
      }
      @media print {
        body {
          padding: 0;
          margin: 0;
        }
        .page-break {
          page-break-before: always;
        }
      }
    </style>
  `;


  let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hasil Perhitungan Profile Matching</title>
      ${printStyles}
    </head>
    <body>
      <div class="print-header">
        <h1>Hasil Perhitungan Profile Matching</h1>
        <p class="subtitle">Sistem Pendukung Keputusan - ${projectName}</p>
        <p class="date">Tanggal: ${new Date().toLocaleDateString()}</p>
      </div>
  `;


  if (sortedAlternatifs.length > 0) {
    const winner = sortedAlternatifs[0];
    const { totalScore } = calculateScoreDetail(winner);
    printContent += `
      <div class="winner-card">
        <h3 class="winner-title">Alternatif Terbaik</h3>
        <p class="font-bold">${winner.kode} - ${winner.nama}</p>
        <p>Ranking #1 dengan nilai ${totalScore}</p>
      </div>
    `;
  }

 
  printContent += `
    <div class="factor-boxes">
      <div class="factor-box core-factor">
        <h4 class="factor-title">Core Factor (CF)</h4>
        <p class="factor-value">${(project.bobot_CF * 100).toFixed(0)}%</p>
      </div>
      <div class="factor-box secondary-factor">
        <h4 class="factor-title">Secondary Factor (SF)</h4>
        <p class="factor-value">${(project.bobot_SF * 100).toFixed(0)}%</p>
      </div>
    </div>
  `;


  printContent += `
    <h2>Hasil Perankingan Akhir</h2>
    <table>
      <thead>
        <tr>
          <th class="text-center">Ranking</th>
          <th>Kode</th>
          <th>Nama Alternatif</th>
          <th class="text-right">Nilai Akhir</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedAlternatifs.forEach((alt, index) => {
    const { totalScore } = calculateScoreDetail(alt);
    printContent += `
      <tr ${index === 0 ? 'class="winner"' : ''}>
        <td class="text-center">${index + 1}</td>
        <td>${alt.kode}</td>
        <td>${alt.nama}</td>
        <td class="text-right">${totalScore}</td>
        <td>${
          index === 0
            ? '<span class="badge badge-green">Terbaik</span>'
            : '<span class="badge">Kandidat</span>'
        }</td>
      </tr>
    `;
  });

  printContent += `
      </tbody>
    </table>
  `;


  printContent += `
    <h2 class="page-break">Detail Perhitungan Per Alternatif</h2>
  `;

  sortedAlternatifs.forEach((alt, altIndex) => {
    const { totalScore, details } = calculateScoreDetail(alt);
    
    printContent += `
      <div class="calculation-box ${altIndex > 0 ? 'page-break' : ''}">
        <h3>${alt.kode} - ${alt.nama} (Ranking #${altIndex + 1})</h3>
        <table>
          <thead>
            <tr>
              <th>Kriteria</th>
              <th>Bobot Kriteria</th>
              <th>NCF (Core Factor)</th>
              <th>NSF (Secondary Factor)</th>
              <th>NCF × ${(project.bobot_CF * 100).toFixed(0)}%</th>
              <th>NSF × ${(project.bobot_SF * 100).toFixed(0)}%</th>
              <th class="text-right">Nilai Kriteria</th>
            </tr>
          </thead>
          <tbody>
    `;

    details.forEach((d) => {
      printContent += `
        <tr>
          <td>${d.kriteriaNama}</td>
          <td>${(d.kriteriaBobot * 100).toFixed(0)}%</td>
          <td>${d.ncf}</td>
          <td>${d.nsf}</td>
          <td>${d.skorCF}</td>
          <td>${d.skorSF}</td>
          <td class="text-right font-bold">${d.skorPerKriteria}</td>
        </tr>
      `;
    });

    printContent += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" class="text-right font-bold">Total Nilai Akhir:</td>
              <td class="text-right font-bold">${totalScore}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  });

  printContent += `
    <div class="calculation-box">
      <h3>Penjelasan Metode Profile Matching</h3>
      <p>Metode Profile Matching menghitung selisih antara profil alternatif dengan profil ideal, kemudian dikonversi menjadi nilai bobot untuk mendapatkan nilai akhir.</p>
      
      <h4>Langkah Perhitungan:</h4>
      <ol>
        <li>Menentukan Core Factor (CF) dan Secondary Factor (SF) untuk setiap kriteria.</li>
        <li>Menghitung nilai rata-rata Core Factor dan Secondary Factor untuk setiap kriteria.</li>
        <li>Menghitung nilai tiap kriteria dengan rumus:
          <p class="formula">N = (${(project.bobot_CF * 100).toFixed(0)}% × NCF) + (${(project.bobot_SF * 100).toFixed(0)}% × NSF)</p>
          <ul>
            <li>N = Nilai kriteria</li>
            <li>NCF = Nilai rata-rata Core Factor</li>
            <li>NSF = Nilai rata-rata Secondary Factor</li>
          </ul>
        </li>
        <li>Menghitung nilai akhir dengan rumus:
          <p class="formula">Nilai Akhir = Σ(N × Bobot Kriteria)</p>
        </li>
        <li>Alternatif dengan nilai akhir tertinggi adalah alternatif terbaik.</li>
      </ol>
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

export default printProfileMatching;
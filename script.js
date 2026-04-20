// ЭЛЕМЕНТЫ
const inputs = {
  orgName: document.getElementById('orgName'),
  docType: document.getElementById('docType'),
  degree: document.getElementById('degree'),
  fullName: document.getElementById('fullName'),
  mentor: document.getElementById('mentor'),
  nomination: document.getElementById('nomination'),
  contestName: document.getElementById('contestName'),
  jobTitle: document.getElementById('jobTitle'),       // Новое поле
  signatoryName: document.getElementById('signatoryName'), // Новое поле
  city: document.getElementById('city'),
  year: document.getElementById('year'),
  qrData: document.getElementById('qrData')
};

const outputs = {
  orgName: document.getElementById('outOrgName'),
  docType: document.getElementById('outDocType'),
  degree: document.getElementById('outDegree'),
  name: document.getElementById('outName'),
  mentor: document.getElementById('outMentor'),
  nomination: document.getElementById('outNomination'),
  contest: document.getElementById('outContest'),
  jobTitle: document.getElementById('outJobTitle'),       // Вывод должности
  signatory: document.getElementById('outSignatory'),     // Вывод ФИО
  city: document.getElementById('outCity'),
  year: document.getElementById('outYear')
};

const downloadBtn = document.getElementById('downloadBtn');
const degreeLabel = document.getElementById('degreeLabel');
const diplomaTemplate = document.getElementById('diplomaTemplate');
const qrCodeContainer = document.getElementById('qrCode');
const qrBlock = document.getElementById('qrBlock'); // Блок-обертка QR

// ОБНОВЛЕНИЕ ПРЕДПРОСМОТРА
function updatePreview() {
  // Организация
  outputs.orgName.textContent = inputs.orgName.value || 'НАЗВАНИЕ ОРГАНИЗАЦИИ';

  // Тип документа
  const isDiploma = inputs.docType.value === 'diploma';
  outputs.docType.textContent = isDiploma ? 'ДИПЛОМ' : 'СЕРТИФИКАТ';
  
  if (isDiploma) {
    degreeLabel.style.display = 'block';
    inputs.degree.style.display = 'block';
    outputs.degree.textContent = inputs.degree.value + ' степени';
    diplomaTemplate.style.borderColor = '#2c74b9';
  } else {
    degreeLabel.style.display = 'none';
    inputs.degree.style.display = 'none';
    outputs.degree.textContent = '';
    diplomaTemplate.style.borderColor = '#2c74b9';
  }

  // Основные данные
  outputs.name.textContent = inputs.fullName.value || 'ФИО Участника';
  outputs.mentor.textContent = inputs.mentor.value || '';
  
  const nomValue = inputs.nomination.value.trim();
  if (nomValue) {
    outputs.nomination.style.display = 'block';
    outputs.nomination.textContent = 'НОМИНАЦИЯ ' + nomValue.toUpperCase();
  } else {
    outputs.nomination.style.display = 'none';
  }

  outputs.contest.textContent = (inputs.contestName.value || 'КОНКУРСА').toUpperCase();
  
  // Подпись
  outputs.jobTitle.textContent = inputs.jobTitle.value || 'Директор';
  outputs.signatory.textContent = inputs.signatoryName.value || 'Иванов И.И.';

  outputs.city.textContent = inputs.city.value || 'Город';
  outputs.year.textContent = inputs.year.value || '2026';

  // Логика QR-кода (Опционально)
  const qrValue = inputs.qrData.value.trim();
  if (qrValue) {
    qrBlock.style.display = 'block'; // Показываем блок
    generateQRCode(qrValue);
  } else {
    qrBlock.style.display = 'none'; // Скрываем блок, если пусто
  }
}

// ГЕНЕРАЦИЯ QR
function generateQRCode(data) {
  qrCodeContainer.innerHTML = '';
  new QRCode(qrCodeContainer, {
    text: data, 
    width: 72, height: 72,
    colorDark: '#2c74b9', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
}

// СЛУШАТЕЛИ
Object.values(inputs).forEach(input => {
  if (input) input.addEventListener('input', updatePreview);
});

// СКАЧИВАНИЕ PDF
downloadBtn.addEventListener('click', () => {
  if (!inputs.fullName.value) {
    alert('⚠️ Введите ФИО участника');
    return;
  }

  const options = {
    margin: 0,
    filename: `${outputs.docType.textContent}_${inputs.fullName.value.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: [297, 210], orientation: 'landscape', compress: true }
  };

  html2pdf().set(options).from(diplomaTemplate).save();
});

// СТАРТ
document.addEventListener('DOMContentLoaded', updatePreview);
// === 1. ОПРЕДЕЛЕНИЕ ЭЛЕМЕНТОВ ===
const inputs = {
    orgName: document.getElementById('orgName'),
    docType: document.getElementById('docType'),
    degree: document.getElementById('degree'),
    fullName: document.getElementById('fullName'),
    mentor: document.getElementById('mentor'),
    nomination: document.getElementById('nomination'),
    contestName: document.getElementById('contestName'),
    jobTitle: document.getElementById('jobTitle'),
    signatoryName: document.getElementById('signatoryName'),
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
    jobTitle: document.getElementById('outJobTitle'),
    signatory: document.getElementById('outSignatory'),
    city: document.getElementById('outCity'),
    year: document.getElementById('outYear')
};

const downloadBtn = document.getElementById('downloadBtn');
const degreeLabel = document.getElementById('degreeLabel');
const diplomaTemplate = document.getElementById('diplomaTemplate');
const qrCodeContainer = document.getElementById('qrCode');
const qrBlock = document.getElementById('qrBlock');
const previewScaler = document.querySelector('.preview-scaler');

// === 2. ФУНКЦИЯ: ОБНОВЛЕНИЕ ПРЕДПРОСМОТРА ===
function updatePreview() {
    outputs.orgName.textContent = inputs.orgName.value || 'НАЗВАНИЕ ОРГАНИЗАЦИИ';
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
    }

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
    outputs.jobTitle.textContent = inputs.jobTitle.value || 'Директор';
    outputs.signatory.textContent = inputs.signatoryName.value || 'Иванов И.И.';
    outputs.city.textContent = inputs.city.value || 'Город';
    outputs.year.textContent = inputs.year.value || '2026';

    const qrValue = inputs.qrData.value.trim();
    if (qrValue) {
        qrBlock.style.display = 'block';
        generateQRCode(qrValue);
    } else {
        qrBlock.style.display = 'none';
    }

    setTimeout(updateDiplomaScale, 50);
}

// === 3. ФУНКЦИЯ: ГЕНЕРАЦИЯ QR ===
function generateQRCode(data) {
    qrCodeContainer.innerHTML = '';
    new QRCode(qrCodeContainer, {
        text: data,
        width: 72,
        height: 72,
        colorDark: '#2c74b9',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}

// === 4. ФУНКЦИЯ: АДАПТИВНОЕ МАСШТАБИРОВАНИЕ ===
function updateDiplomaScale() {
    const previewPanel = document.querySelector('.preview-panel');
    const diploma = diplomaTemplate;
    if (!previewPanel || !diploma) return;

    const panelWidth = previewPanel.clientWidth;
    const panelHeight = previewPanel.clientHeight;
    const targetWidth = 1123;
    const targetHeight = 794;

    const scaleX = (panelWidth - 40) / targetWidth;
    const scaleY = (panelHeight - 40) / targetHeight;
    let scale = Math.min(scaleX, scaleY, 1);

    if (window.innerWidth <= 768) {
        scale = Math.max(scale, 0.35);
    }

    previewScaler.style.transform = `scale(${scale})`;
    previewScaler.style.height = `${targetHeight * scale}px`;
    diploma.style.margin = '0 auto';
}

// === 5. СЛУШАТЕЛИ INPUT ===
Object.values(inputs).forEach(input => {
    if (input) input.addEventListener('input', updatePreview);
});

// === 6. СКАЧИВАНИЕ PDF (ОКОНЧАТЕЛЬНОЕ РЕШЕНИЕ) ===
downloadBtn.addEventListener('click', async () => {
    if (!inputs.fullName.value) {
        alert('⚠️ Введите ФИО участника');
        return;
    }

    // Блокируем кнопку
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '⏳ Генерация...';

    // Сохраняем оригинальные стили
    const originalDisplay = diplomaTemplate.style.display;
    const originalTransform = previewScaler.style.transform;
    const originalHeight = previewScaler.style.height;
    
    // Временно убираем масштабирование
    previewScaler.style.transform = 'scale(1)';
    previewScaler.style.height = '210mm';
    diplomaTemplate.style.boxShadow = 'none';
    diplomaTemplate.style.borderRadius = '0';

    try {
        // Ждем применения стилей
        await new Promise(resolve => setTimeout(resolve, 100));

        // Настройки для html2pdf
        const options = {
            margin: 0,
            filename: `${outputs.docType.textContent}_${inputs.fullName.value.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
                scale: 2,
                useCORS: true, 
                logging: false,
                windowWidth: 1123,
                windowHeight: 794,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0
            },
            jsPDF: { 
                unit: 'mm', 
                format: [297, 210], 
                orientation: 'landscape', 
                compress: true 
            }
        };

        // Генерируем PDF из оригинального элемента
        await html2pdf().set(options).from(diplomaTemplate).save();

    } catch (err) {
        console.error('Ошибка PDF:', err);
        alert('Ошибка при создании PDF');
    } finally {
        // Возвращаем стили обратно
        previewScaler.style.transform = originalTransform;
        previewScaler.style.height = originalHeight;
        diplomaTemplate.style.boxShadow = '';
        diplomaTemplate.style.borderRadius = '';
        
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '📥 Скачать (PDF)';
        
        updateDiplomaScale();
    }
});

// === 7. СЛУШАТЕЛИ АДАПТИВНОСТИ ===
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateDiplomaScale, 150);
});

window.addEventListener('orientationchange', () => {
    setTimeout(updateDiplomaScale, 300);
});

if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
        updateDiplomaScale();
    });
    const panel = document.querySelector('.preview-panel');
    if (panel) resizeObserver.observe(panel);
}

// === 8. ЗАПУСК ===
document.addEventListener('DOMContentLoaded', () => {
    updatePreview();
    setTimeout(updateDiplomaScale, 200);
});
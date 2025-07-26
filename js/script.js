const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const convertBtn = document.getElementById('convertBtn');
const dropZone = document.getElementById('dropZone');

let selectedFile = null;

// Show filename + button on file select
fileInput.addEventListener('change', () => {
  selectedFile = fileInput.files[0];
  if (selectedFile) {
    fileNameDisplay.textContent = `Selected: ${selectedFile.name}`;
    fileNameDisplay.classList.remove('hidden');
    convertBtn.classList.remove('hidden');
  }
});

// Drag-and-drop support
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('ring-2', 'ring-primary');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('ring-2', 'ring-primary');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('ring-2', 'ring-primary');

  const file = e.dataTransfer.files[0];
  if (file) {
    selectedFile = file;
    fileInput.files = e.dataTransfer.files;
    fileNameDisplay.textContent = `Selected: ${file.name}`;
    fileNameDisplay.classList.remove('hidden');
    convertBtn.classList.remove('hidden');
  }
});

// Convert to PDF → Upload to Flask
convertBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  const formData = new FormData();
  formData.append('file', selectedFile);

  convertBtn.textContent = "Converting...";
  convertBtn.disabled = true;

  try {
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error("Conversion failed");

    const blob = await response.blob();
    const pdfUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = selectedFile.name.split('.').slice(0, -1).join('.') + ".pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    convertBtn.textContent = "Convert to PDF";
    convertBtn.disabled = false;
  } catch (error) {
    alert("Conversion failed. Try again.");
    convertBtn.textContent = "Convert to PDF";
    convertBtn.disabled = false;
  }
});

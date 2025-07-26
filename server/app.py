from flask import Flask, request, send_file
from werkzeug.utils import secure_filename
import os
from fpdf import FPDF
from docx import Document
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    uploaded_file = request.files['file']
    filename = secure_filename(uploaded_file.filename)
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    uploaded_file.save(input_path)

    # Convert to PDF
    output_path = os.path.join(UPLOAD_FOLDER, filename.rsplit('.', 1)[0] + '.pdf')

    ext = filename.rsplit('.', 1)[1].lower()
    if ext in ['txt']:
        with open(input_path, 'r', encoding='utf-8') as f:
            text = f.read()

        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_font('DejaVu', '', 'fonts/DejaVuSans.ttf', uni=True)  # ✅ Use Unicode font
        pdf.set_font('DejaVu', '', 12)

        for line in text.split('\n'):
            pdf.multi_cell(0, 10, line)

        pdf.output(output_path)

    elif ext in ['docx']:
        doc = Document(input_path)
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_font('DejaVu', '', 'fonts/DejaVuSans.ttf', uni=True)
        pdf.set_font('DejaVu', '', 12)

        for para in doc.paragraphs:
            pdf.multi_cell(0, 10, para.text)

        pdf.output(output_path)

    elif ext in ['jpg', 'jpeg', 'png']:
        from PIL import Image
        image = Image.open(input_path).convert('RGB')
        image.save(output_path)

    else:
        return {'error': 'Unsupported file type'}, 400

    return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)

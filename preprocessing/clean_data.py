import pdfplumber
import os

def extract_srs_text(pdf_path, output_txt_path):
    all_text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                all_text += text + "\n"

    os.makedirs(os.path.dirname(output_txt_path), exist_ok=True)

    with open(output_txt_path, "w", encoding="utf-8") as f:
        f.write(all_text)

    print("✅ SRS Text Extracted Successfully!")
    print("Saved at:", output_txt_path)


if __name__ == "__main__":
    extract_srs_text(
        pdf_path=r"D:\SDLC\data\srs.pdf",
        output_txt_path=r"D:\SDLC\outputs\srs.txt"

    )

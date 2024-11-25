# Service OCR & Vérification d'Identité
> Extraction automatisée de données d'identité avec OCR et vérification faciale

## Description
Application Flask/React permettant l'extraction de données depuis des documents d'identité via OCR (PaddleOCR) avec vérification faciale complémentaire. Interface de visualisation des résultats et historique des extractions.

## 🛠 Technologies
- **API**: Python (Flask, paddleOCR, OpenCV)
- **Frontend**: React

## 📦 Installation
### Flask
```bash
python -m venv env
source env/bin/activate     # Linux/Mac
env\Scripts\activate        # Windows
pip install -r requirements.txt
python main.py
```

### Front
```bash
cd front
npm install
npm start
```

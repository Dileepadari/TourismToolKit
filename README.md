# TourismToolKit

## 🌍 Your Multilingual Travel Companion

TourismToolKit is a comprehensive, full-stack application designed to break down language barriers for travelers worldwide. Powered by AnuvaadHub/Bhashini APIs, our platform delivers seamless translation across multiple modalities (speech, text, images) to enhance your travel experience.

## ✨ Key Features

### 📱 Multimodal Translation
- **Text Translation**: Instant translation between multiple languages
- **Speech-to-Text**: Convert spoken language to text in real-time
- **Text-to-Speech**: Transform written content into natural-sounding audio
- **Image OCR**: Extract and translate text from photos, menus, and signboards

### 🔄 Seamless Workflows
- Chain together multiple translation services in a single request (ASR → MT → TTS)
- AR-ready OCR+MT pipeline optimized for real-world travel scenarios

### 🗣️ Real-time Tour Guide Mode
- Host translation sessions for groups
- Speak in one language, others receive translations in their preferred languages
- Perfect for tour guides and multilingual gatherings

### 📒 Smart Phrasebook
- Save and organize frequently used phrases
- Offline access to translations with audio pronunciations
- Cultural context and tips for more authentic communication

### 👥 Community Improvement
- Rate and correct translations to improve accuracy
- Contribute to a better experience for future travelers

### 🎨 Polished User Experience
- Elegant UI with light/dark themes
- Fully responsive design for all devices
- Accessible interface (WCAG AA compliant)
- Multilingual interface support

## 💻 Tech Stack

### Frontend
- **React** with Next.js
- JavaScript/CSS
- npm package management

### Backend
- **Python** with Flask
- PM2 process manager
- RESTful API architecture

### Deployment
- PM2 for process management
- Bash scripts for automation

## 🚀 Getting Started

### Prerequisites
- Node.js
- Python 3.x
- PM2 (`npm install pm2 -g`)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/TourismToolKit.git
cd TourismToolKit
```

2. Run the deployment script
```bash
chmod +x deploy.sh
./deploy.sh
```

3. Alternatively, manual setup:

    **Backend:**
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pm2 start app.py --name backend --interpreter python
    ```

    **Frontend:**
    ```bash
    cd frontend
    npm install
    pm2 start npm --name frontend -- start
    ```

4. Use `pm2 status` to check running services

## 🤝 Contributing

We welcome contributions to TourismToolKit! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

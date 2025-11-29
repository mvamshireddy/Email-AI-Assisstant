📧 AI Email Reply Assistant (Chrome Extension + Spring Boot)

An intelligent Chrome extension that integrates directly into Gmail to generate context-aware email replies using the Google Gemini API. Built with a robust Spring Boot backend and a Vanilla JavaScript frontend.

✨ Features

Seamless Gmail Integration: Injects an "AI Reply" button directly into the Gmail toolbar.

Context Aware: Scrapes the incoming email content to generate relevant responses.

Tone Selection: Choose from multiple tones: Professional, Casual, Friendly, Formal, or Witty.

Native UI: The button and dropdowns are styled to look exactly like native Gmail components.

Secure Backend: API keys and logic are handled server-side using Spring Boot.

🏗️ Architecture

Frontend (Chrome Extension):

manifest.json (V3): Configures permissions and content scripts.

content.js: Handles DOM manipulation, button injection, and scraping email content.

MutationObserver: Detects when the "Compose" window opens to inject the UI dynamically.

Backend (Spring Boot):

WebClient: Handles asynchronous API calls to Google Gemini.

Prompt Engineering: Constructs dynamic prompts based on email content and selected tone.

🚀 Getting Started

Prerequisites

Java 17 or 21

Maven

Google Chrome

A Google Gemini API Key

1. Backend Setup (Spring Boot)

Clone the repository.

Navigate to the backend folder.

Configure your API Key in application.properties or environment variables:

gemini.api.key=YOUR_GEMINI_API_KEY
gemini.api.url=[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent)


Run the application:

mvn spring-boot:run


The server will start at http://localhost:8080

2. Extension Setup

Open Chrome and navigate to chrome://extensions.

Toggle Developer mode (top right corner).

Click Load unpacked.

Select the extension folder from this repository.

Open Gmail, click "Reply" on an email, and look for the AI Reply button!

📸 Screenshots

<!-- You can drag and drop your screenshots here in GitHub editing mode -->

(Add a screenshot of the button here)
(Add a screenshot of the generated reply here)

🛠️ Troubleshooting

Button not showing? Refresh the Gmail tab. The script waits for the DOM to load.

API Error? Ensure the Spring Boot backend is running on port 8080.

CORS Issues? The backend is configured to allow requests from mail.google.com.

🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

📄 License

This project is licensed under the MIT License.

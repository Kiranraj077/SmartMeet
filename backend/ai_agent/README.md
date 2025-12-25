# SmartMeet AI – Multi-Agent Google Meet Assistant

SmartMeet AI is a local, privacy-preserving multi-agent system that processes Google Meet transcripts and performs the following tasks automatically:

✅ Summarizes the meeting  
✅ Extracts persona-specific action items  
✅ Emails each participant their own summary and action item

---

## 📁 Project Structure

```bash
multi_agent_meet/
├── agents/
│ ├── summarizer_agent.py # Uses LLaMA 3 (via Ollama) to summarize transcript
│ ├── task_extractor_agent.py # Extracts tasks per person from summary
│ └── email_agent.py # Sends personalized emails via Gmail SMTP
├── sample_transcript.json # Sample Google Meet transcript
├── main.py # Orchestrates the entire pipeline
├── .env # Contains Gmail credentials for email agent
```

---

## Features

- Uses **Meta’s LLaMA 3** locally with [Ollama](https://ollama.com/) — no API key needed
- Persona-specific task extraction
- Sends individual task assignments over **email**
- Fully local + secure with `.env` for secrets

---

## 🛠 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Abhishek-7504/ai-agent.git
cd multi_agent_meet
```
### 2. Create and activate a virtual environment
```bash
python -m venv agent_env
.\agent_env\Scripts\Activate.ps1     # for PowerShell on Windows
```
### 3. Install dependencies
```bash
pip install ollama python-dotenv
```
### 4. Install and run Ollama with LLaMA 3

Download and install [Ollama](https://ollama.com/download) and run:
```bash
ollama run llama3
```
### 5. Set up your .env file
```bash
EMAIL_ADDRESS=your.email@gmail.com
EMAIL_PASSWORD=your_app_password   # generated from Gmail App Passwords
```
### 6. Run the system
```bash
python main.py
```

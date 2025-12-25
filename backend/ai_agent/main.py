import json
import re
from agents.summarizer_agent import SummarizerAgent
from agents.task_extractor_agent import TaskExtractorAgent
from agents.email_agent import EmailAgent

def extract_json_block(text):
    match = re.search(r'\{.*?\}', text, re.DOTALL)
    if match:
        return match.group(0)
    else:
        raise ValueError("No valid JSON object found in text.")

# Load transcript
with open("sample_transcript.json") as f:
    data = json.load(f)

# Extract host (optional field in JSON)
host = data.get("host", None)

# Collect unique speakers
participants = set(entry["speaker"] for entry in data["transcript"])

# Get emails from user input
print("\n🔹 Please enter email addresses for each participant:\n")
emails = {}
for person in participants:
    email = input(f"📧 Email for {person}: ").strip()
    emails[person] = email

if host:
    print(f"\n👤 Host of the meeting: {host} ({emails.get(host, 'No email provided')})\n")

# Initialize agents
summarizer = SummarizerAgent()
task_extractor = TaskExtractorAgent()
email_agent = EmailAgent(user_email_map=emails)  # Pass emails to agent

# Generate summary
summary = summarizer.run(data)
print("\n🔹 Summary:\n", summary)

# Extract tasks
tasks = task_extractor.run(data)
print("\n🔹 Raw Action Items:\n", tasks)

# Parse JSON block
try:
    json_text = extract_json_block(tasks)
    parsed_tasks = json.loads(json_text)
except Exception as e:
    print("\n❌ Could not extract valid JSON from model output.")
    print("Returned text:\n", tasks)
    raise e

# Send personalized emails
for person, task in parsed_tasks.items():
    email_agent.send_personalized_email(
        name=person,
        subject="Your Meeting Summary & Action Item",
        summary=summary,
        task=task
    )

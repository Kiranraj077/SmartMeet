from langchain_ollama import OllamaLLM
from crewai import Agent, Task
from meeting_automation.tools.email_sender_tool import send_emails
import json
import re

# === Step 1: LLM Setup ===
llm = OllamaLLM(model="llama3")

# === Step 2: Prompt for Transcript Analysis ===
prompt = """
You are given a transcript of a meeting:

Alice (alice@example.com): My name is Alice. I am a student in Harvard University pursuing MS in Deep Learning. I am specialised in Tensorflow and PyTorch. I leverage the poewer of RTX GPUs to get my tasks done with PyTorch. So your supposed to research on these and tell me how i can develop high level applicatinons using this.
Bob (bob@example.com): That;s very good to hear Alice! I'm a student in MIT, and my specialization is on Vision Language Models. They are LLMs which can take in multimodal input, are context aware and a user can question the LLM about anything regarding the input.I need you to go through these vision language models, you can find them on OpenCV website too.

Extract a 3-5 sentence summary and identify all action items.
Assign tasks to participants using their email addresses.
Your output MUST be a valid JSON object ONLY. No explanation.

Format:

{
  "summary": "short summary",
  "tasks": [
    {"email": "alice@example.com", "assigned_tasks": ["task1", "task2"]}
  ]
}
"""

print("\nSending transcript to LLaMA...\n")
response = llm.invoke(prompt)

# === Step 3: Extract clean JSON ===
match = re.search(r'\{.*\}', response, re.DOTALL)
if not match:
    print(" No JSON found in model output.")
    exit()

try:
    data = json.loads(match.group(0))
    print("\n CLEANED JSON:")
    print(json.dumps(data, indent=2))
except json.JSONDecodeError as e:
    print(" Failed to decode JSON:", str(e))
    exit()

# === Step 4: Define Email Composer Agent ===
email_agent = Agent(
    role="Email Communication Specialist",
    goal="Write professional follow-up emails summarizing meeting outcomes and tasks.",
    backstory=(
        "You are skilled at transforming structured data into clear, actionable follow-up emails for each participant."
    ),
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# === Step 5: Build Prompt for Composing Emails Directly ===
email_prompt = f"""
You are given a meeting summary and a list of participants with their assigned tasks.

Summary:
{data['summary']}

Participants and their tasks:
{json.dumps(data['tasks'], indent=2)}

Write a separate, professional follow-up email for each person.

Return a JSON dictionary in this exact format:
{{
  "alice@example.com": "Email body for Alice",
  "bob@example.com": "Email body for Bob"
}}

Only return the JSON. Do not include explanations.
"""

# === Step 6: Call LLaMA Directly ===
print("\nGenerating follow-up emails via LLaMA...\n")
email_response = llm.invoke(email_prompt)

# === Step 7: Extract and Parse JSON ===
match = re.search(r'\{.*\}', email_response, re.DOTALL)
if not match:
    print(" No JSON found in email output.")
    exit()

try:
    email_dict = json.loads(match.group(0))
    print("\n GENERATED EMAILS:\n")
    for recipient, body in email_dict.items():
        print(f"\n📨 To: {recipient}\n{body}\n")
except json.JSONDecodeError as e:
    print(" JSON decode failed for email output:", str(e))


# === Step 7: Optional - Actually Send Emails ===
# To enable real sending, uncomment below:
# try:
#     emails = json.loads(email_output)
#     status = send_emails(emails)
#     print("\n✅ EMAILS SENT:")
#     print(status)
# except Exception as e:
#     print("❌ Failed to send emails:", str(e))

from crewai import Agent, Task, Crew, Process
from meeting_automation.tools.email_sender_tool import send_emails
from langchain_ollama import OllamaLLM
llm = OllamaLLM(model="llama3")

# === AGENTS ===

task_extractor = Agent(
    role='Transcript Analyst',
    goal='Extract summary and action items from meeting transcript',
    backstory=(
        "You're an expert in NLP and meeting comprehension. "
        "You analyze meeting transcripts and assign specific tasks to the right people using their emails."
    ),
    verbose=True,
    allow_delegation=False,
    llm=llm  #  comma added
)

email_composer = Agent(
    role='Email Composer',
    goal='Write clear and professional follow-up emails based on assigned tasks',
    backstory=(
        "You are a professional communication specialist who turns summaries and tasks "
        "into polished emails for each participant."
    ),
    verbose=True,
    allow_delegation=False,
    llm=llm  # comma added
)

# === TASKS ===

task_extraction_task = Task(
    description=(
        "You are given a transcript of a meeting:\n\n{input}\n\n"
        "Extract a 3-5 sentence summary and identify all action items. "
        "Assign tasks to participants using their email addresses. "
        "Your output MUST be a valid JSON like:\n\n"
        "{\n"
        "  \"summary\": \"short summary\",\n"
        "  \"tasks\": [\n"
        "    {\"email\": \"alice@example.com\", \"assigned_tasks\": [\"task1\", \"task2\"]}\n"
        "  ]\n"
        "}"
    ),
    expected_output="A valid JSON string with a summary and assigned tasks.",
    agent=task_extractor
)


email_composing_task = Task(
    description=(
        "You are given the JSON from the previous step that includes meeting summary and assigned tasks. "
        "Generate a clear, well-formatted email for each recipient that includes:\n"
        "- A professional greeting\n"
        "- The summary\n"
        "- A bulleted list of their tasks\n"
        "- A polite closing\n\n"
        "Output must be a dictionary mapping email → email body string."
    ),
    expected_output="A dictionary mapping emails to their personalized email text",
    agent=email_composer
)

# === CREW ===

crew = Crew(
    agents=[task_extractor, email_composer],
    tasks=[task_extraction_task, email_composing_task],
    process=Process.sequential
)

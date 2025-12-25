import ollama
from typing import Dict

class SummarizerAgent:
    def __init__(self, model='llama3'):
        self.model = model

    def run(self, input_data: Dict):
        transcript = "\n".join([f"{t['speaker']}: {t['text']}" for t in input_data['transcript']])
        prompt = f"""
You are an AI assistant. Summarize the following meeting transcript in a clear and concise paragraph:

Transcript:
{transcript}
"""
        response = ollama.chat(model=self.model, messages=[
            {"role": "user", "content": prompt}
        ])
        return response['message']['content']

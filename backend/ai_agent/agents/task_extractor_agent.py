import ollama
import re
from typing import Dict

class TaskExtractorAgent:
    def __init__(self, model='llama3'):
        self.model = model

    def extract_json_block(self, text: str) -> str:
        # Extract the first valid JSON block
        match = re.search(r'\{[\s\S]*?\}', text)
        if match:
            return match.group(0)
        else:
            raise ValueError("❌ No valid JSON object found in the model output.")

    def run(self, input_data: Dict):
        transcript = "\n".join([f"{t['speaker']}: {t['text']}" for t in input_data['transcript']])
        prompt = f"""
Extract the action items for each participant based on this transcript.
Return the result as a JSON object like:

{{
  "Alice": "task",
  "Bob": "task"
}}

Transcript:
{transcript}
"""
        response = ollama.chat(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )

        raw_output = response['message']['content']
        return self.extract_json_block(raw_output)

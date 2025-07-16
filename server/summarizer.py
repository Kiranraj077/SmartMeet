import sys
from ctransformers import AutoModelForCausalLM


model = AutoModelForCausalLM.from_pretrained(
    "./llms/mistral-7b-instruct-v0.2.Q4_K_M.gguf", 
    model_type="mistral",
    max_new_tokens=512,
    temperature=0.7,
    repetition_penalty=1.1,
    stop=["</s>"]
)

def build_prompt(text):
    return (
        "You are an assistant that summarizes meeting conversations. "
        "Write a natural, human-readable summary of the discussion below. "
        "Do not repeat the dialogue; instead, explain what happened as a narrative:\n\n"
        f"{text.strip()}\n\nSummary:"
    )


def main():
    full_text = sys.stdin.read()
    if not full_text.strip():
        print("No input received.")
        return

    prompt = build_prompt(full_text)
    summary = model(prompt)
    print(summary.strip())

if __name__ == "__main__":
    main()







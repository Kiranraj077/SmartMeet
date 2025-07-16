# summarizer.py

import sys
from transformers import pipeline

def split_text(text, max_len=1000):
    words = text.split()
    chunks, curr = [], ""
    for w in words:
        if len(curr) + len(w) + 1 > max_len:
            chunks.append(curr)
            curr = w
        else:
            curr += (" " + w) if curr else w
    if curr:
        chunks.append(curr)
    return chunks

def main():
    # Read full transcript from stdin
    full_text = sys.stdin.read()

    if not full_text.strip():
        print("No content provided to summarize.")
        return

    # Initialize summarizer (using DistilBART)
    summarizer = pipeline(
        "summarization",
        model="sshleifer/distilbart-cnn-12-6",
        framework="pt"  # Use PyTorch backend
    )

    chunks = split_text(full_text, max_len=1000)

    # Summarize each chunk
    summaries = []
    for chunk in chunks:
        try:
            summary = summarizer(
                chunk,
                max_length=150,
                min_length=40,
                do_sample=False
            )
            summaries.append(summary[0]["summary_text"])
        except Exception as e:
            summaries.append("[Summary failed for chunk]")

    final_summary = "\n".join(summaries)
    print(final_summary)

if __name__ == "__main__":
    main()

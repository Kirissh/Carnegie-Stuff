import os  # For accessing environment variables
from pathlib import Path
#taken llm7 api @ https://token.llm7.io/
from dotenv import load_dotenv  # Library to load environment variables from .env file
from openai import OpenAI  # Import the OpenAI client library

ENV_PATH = Path(__file__).resolve().parent / ".env"


def run_llm7_terminal():
    # Step 1: Load environment variables from .env next to this script
    if not ENV_PATH.is_file():
        raise ValueError(
            f"Runtime Error: No .env file found at {ENV_PATH}. "
            "Create one with LLM7_API_KEY=your_token (get a token at https://token.llm7.io)."
        )

    load_dotenv(ENV_PATH)

    # Retrieve the LLM7 API key from environment variables
    api_key = os.environ.get("LLM7_API_KEY")
    if not api_key:
        raise ValueError(
            f"Runtime Error: Missing LLM7_API_KEY in {ENV_PATH}. "
            "Save the file if you added the key in your editor, then try again."
        )

    # Step 2: Create an OpenAI client specifying the LLM7 endpoint and API key
    client = OpenAI(
        base_url="https://api.llm7.io/v1",
        api_key=api_key
    )

    while True:
        try:
            # Step 3: Prompt user for input via terminal
            user_prompt = input("\nType your prompt for LLM7 (or type 'exit' to quit): ")
            if user_prompt.lower() in ['exit', 'quit']:
                print("Exiting LLM7 terminal chat. Goodbye!")
                break

            print("Transmitting request packet to LLM7 edge aggregation layer...")

            response = client.chat.completions.create(
                model="default",
                messages=[
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                temperature=0.7  # Controls the randomness of the output
            )

            llm7_output = response.choices[0].message.content
            print("\n--- LLM7 Response ---")
            print(llm7_output)
            print("---------------------\n")

        except Exception as e:
            # Print error details if API request fails
            print(f"\nExecution Failure: Connection intercepted or dropped by the gateway.\nDetails: {e}")

if __name__ == "__main__":
    # Execute the terminal chat function if the script is run directly
    run_llm7_terminal()
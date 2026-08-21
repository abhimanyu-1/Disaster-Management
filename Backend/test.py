import os
from dotenv import load_dotenv
from google import genai
from PIL import Image

# 1. Load the API key from your .env file
load_dotenv()

# Verify the API key was loaded (optional but helpful for debugging)
if not os.getenv("GEMINI_API_KEY"):
    print("Error: GEMINI_API_KEY not found in .env file.")
    exit(1)

# 2. Initialize the Gemini client
# It automatically detects the GEMINI_API_KEY environment variable
client = genai.Client()

def test_multimodal():
    # 3. Define your prompt and load a local image
    # IMPORTANT: Replace 'sample.jpg' with the path to a real image on your computer
    image_path = "image.jpg" 
    prompt_text = "Describe what you see in this image in two sentences."
    
    try:
        print(f"Loading image from {image_path}...")
        image = Image.open(image_path)
        
        print("Sending request to Gemini 3.7 Flash...")
        # 4. Call the model with a list containing both the text and the image
        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=[prompt_text, image]
        )
        
        # 5. Print the result
        print("\n=== Gemini Response ===")
        print(response.text)
        print("=======================")
        
    except FileNotFoundError:
        print(f"Error: Could not find the image '{image_path}'. Please check the path and try again.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_multimodal()
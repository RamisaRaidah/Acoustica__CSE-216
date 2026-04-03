import os
from google import genai
from dotenv import load_dotenv
import time
from google.genai.errors import ClientError

load_dotenv()

client = genai.Client(api_key=os.getenv("ACOUSTICA_GEMINI_AGENT_API_KEY"))

def generate_response(user_prompt, available_resources):
    system_instruction = f"""
    You are the Acoustica Mood Agent. 
    Analyze the user's mood and pick the best matches from the lists below.
    
    AVAILABLE RESOURCES:
    - Genres: {available_resources['genres']}
    - Moods: {available_resources['moods']}
    - Languages: {available_resources['languages']}
    - Instruments: {available_resources['instruments']}
    - Artists: {available_resources['artists']}
    
    STRICT RULES:
    1. Only pick items from the lists above.
    2. Respond ONLY in valid JSON format.
    3. You will return a list of selected ids, not the descriptive name. For example, for genres you will return a list ids of preferred genres not the actual genre names.
    4. Always reply with the asking fields only. If no data matches return empty list. The output will be of form:
        {{
            "genres": [1, 2],
            "moods": [1, 2],
            "languages": [1, 2]
            "instruments": [1, 2]
            "artists": [1, 2]
        }}
    5. If you can not deduce required fields from user prompt then just return empty lists instead of other message.
    6. Don't add more than 10 items in any list.
    7. If you don't get clear indication about a field, don't add based on assumption. For example, if i ask for romantic songs, you will pick romantic mood. Don't pick random genres, more moods, random intruments or random artist. Only pick what user explicitly say or implicitly infer.
    """

    prompt = f"User says: {user_prompt}"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config={
                "system_instruction": system_instruction,
                "response_mime_type": "application/json"
            },
            contents=prompt
        )
        return response.text
    except ClientError as e:
        if e.code == 429:
            raise  
        raise
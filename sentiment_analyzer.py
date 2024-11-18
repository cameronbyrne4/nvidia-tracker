from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def analyze_sentiment(text):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a financial sentiment analyzer. Analyze the sentiment of investment-related text and return ONLY a JSON object with the following structure: {\"sentiment\": \"positive/negative/neutral\", \"confidence\": 0.0-1.0, \"explanation\": \"brief explanation\"}"
                },
                {
                    "role": "user",
                    "content": f"Analyze the investment sentiment of this text: {text}"
                }
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        result = response.choices[0].message.content
        print(f"[DEBUG] Sentiment analysis result: {result}")
        return result
    except Exception as e:
        print(f"[ERROR] Sentiment analysis failed: {str(e)}")
        return None
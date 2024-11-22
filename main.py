# main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
from scraper import search_nvidia_mentions
import pandas as pd
from openai import OpenAI
from config import OPENAI_API_KEY
from sentiment_analyzer import analyze_multiple_sentiments
import json

app = FastAPI(title="NVIDIA Mentions Tracker")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "NVIDIA Mentions Tracker API"}

# In main.py
@app.get("/mentions")
async def get_mentions(limit: int = 10):
    try:
        subreddits = ['wallstreetbets', 'stocks', 'investing', 'nvidia']
        all_mentions = []
        seen_post_ids = set()
        
        print("\n[DEBUG] Starting mention collection...")
        
        for subreddit in subreddits:
            df = await search_nvidia_mentions(subreddit, limit=limit)  # Call async function
            if not df.empty:
                # Filter out any duplicates before adding to all_mentions
                new_posts = df[~df['post_id'].isin(seen_post_ids)]
                if not new_posts.empty:
                    print(f"\n[DEBUG] Adding {len(new_posts)} new posts from r/{subreddit}")
                    for _, post in new_posts.iterrows():
                        print(f"[DEBUG] - {post['title']} (ID: {post['post_id']})")
                    all_mentions.append(new_posts)
                    seen_post_ids.update(new_posts['post_id'].tolist())
        
        if not all_mentions:
            print("[DEBUG] No mentions found")
            return {"mentions": [], "message": "No mentions found"}
            
        # Combine all mentions and sort by timestamp
        combined_df = pd.concat(all_mentions, ignore_index=True)
        combined_df = combined_df.sort_values('timestamp', ascending=False)
        
        mentions = combined_df.to_dict('records')
        print(f"\n[DEBUG] Final total unique posts: {len(mentions)}")

        # Calculate final sentiment
        sentiments = []
        for mention in mentions:
            sentiment_data = json.loads(mention['sentiment'])
            sentiments.append({
                'sentiment': sentiment_data['sentiment'],
                'confidence': sentiment_data['confidence'],
                'explanation': sentiment_data['explanation']
            })

        final_sentiment_data = await analyze_multiple_sentiments(sentiments)  # Call async function

        return {
            "mentions": mentions,
            "count": len(mentions),
            "timestamp": datetime.now().isoformat(),
            "final_sentiment": final_sentiment_data  # Include final sentiment in the response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
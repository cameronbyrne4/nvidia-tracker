# main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
from scraper import search_nvidia_mentions
import pandas as pd

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

@app.get("/mentions")
async def get_mentions(limit: int = 10):
    try:
        # Get mentions from each subreddit
        subreddits = ['wallstreetbets', 'stocks', 'investing', 'nvidia']
        all_mentions = []
        
        for subreddit in subreddits:
            df = search_nvidia_mentions(subreddit, limit=limit)
            if not df.empty:
                all_mentions.append(df)
        
        if not all_mentions:
            return {"mentions": [], "message": "No mentions found"}
            
        # Combine all mentions
        combined_df = pd.concat(all_mentions, ignore_index=True)
        combined_df = combined_df.sort_values('timestamp', ascending=False)
        
        # Convert DataFrame to list of dictionaries
        mentions = combined_df.to_dict('records')
        
        return {
            "mentions": mentions,
            "count": len(mentions),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
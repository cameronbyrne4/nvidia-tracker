# scraper.py

import praw
import pandas as pd
from datetime import datetime
from config import REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT

def init_reddit():
    try:
        reddit = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            user_agent=REDDIT_USER_AGENT
        )
        # Test the connection
        reddit.user.me()
        return reddit
    except Exception as e:
        print(f"Authentication Error: {str(e)}")
        print(f"Using credentials - Client ID: {REDDIT_CLIENT_ID[:5]}... User Agent: {REDDIT_USER_AGENT}")
        return None

def search_nvidia_mentions(subreddit_name, limit=10):
    reddit = init_reddit()
    if not reddit:
        return pd.DataFrame()  # Return empty DataFrame if authentication fails
        
    try:
        subreddit = reddit.subreddit(subreddit_name)
        mentions = []
        search_terms = ['NVDA', 'Nvidia', 'nvidia']
        
        for term in search_terms:
            try:
                for submission in subreddit.search(term, limit=limit):
                    mentions.append({
                        'post_id': submission.id,
                        'title': submission.title,
                        'content': submission.selftext,
                        'subreddit': subreddit_name,
                        'timestamp': datetime.fromtimestamp(submission.created_utc),
                        'upvotes': submission.score,
                        'comment_count': submission.num_comments,
                        'url': f'https://reddit.com{submission.permalink}'
                    })
            except Exception as e:
                print(f"Error searching for term '{term}' in r/{subreddit_name}: {str(e)}")
                
        return pd.DataFrame(mentions)
    except Exception as e:
        print(f"Error accessing r/{subreddit_name}: {str(e)}")
        return pd.DataFrame()

def main():
    subreddits = ['wallstreetbets', 'stocks', 'investing', 'nvidia']
    all_mentions = []
    
    for subreddit in subreddits:
        df = search_nvidia_mentions(subreddit)
        if not df.empty:
            all_mentions.append(df)
    
    if not all_mentions:
        print("No data was collected. Please check your Reddit API credentials.")
        return pd.DataFrame()
        
    all_mentions_df = pd.concat(all_mentions, ignore_index=True)
    
    # Remove duplicates and sort by timestamp
    if not all_mentions_df.empty:
        all_mentions_df = all_mentions_df.drop_duplicates(subset='post_id')
        all_mentions_df = all_mentions_df.sort_values('timestamp', ascending=False)
    
    print(f"Found {len(all_mentions_df)} mentions")
    return all_mentions_df

if __name__ == "__main__":
    print("Starting Reddit scraper...")
    print(f"Testing connection with credentials:")
    print(f"Client ID length: {len(REDDIT_CLIENT_ID)}")
    print(f"Client Secret length: {len(REDDIT_CLIENT_SECRET)}")
    print(f"User Agent: {REDDIT_USER_AGENT}")
    
    mentions_df = main()
    if not mentions_df.empty:
        print("\nMost recent mentions:")
        print(mentions_df[['title', 'subreddit', 'upvotes', 'timestamp']].head())
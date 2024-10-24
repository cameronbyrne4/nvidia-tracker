# scraper.py

import praw
import pandas as pd
from datetime import datetime
from config import REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT

def init_reddit():
    return praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )

def search_nvidia_mentions(subreddit_name, limit=10):
    reddit = init_reddit()
    subreddit = reddit.subreddit(subreddit_name)
    
    mentions = []
    search_terms = ['NVDA', 'Nvidia', 'nvidia', 'NVIDIA', 'nvda']
    
    for term in search_terms:
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
    
    return pd.DataFrame(mentions)

def main():
    subreddits = ['wallstreetbets', 'stocks', 'investing', 'nvidia']
    # Yeah, wall street bets!!
    all_mentions = pd.DataFrame()
    
    for subreddit in subreddits:
        try:
            df = search_nvidia_mentions(subreddit)
            all_mentions = pd.concat([all_mentions, df], ignore_index=True)
        except Exception as e:
            print(f"Error scraping r/{subreddit}: {str(e)}")
    
    # Remove duplicates and sort by timestamp
    all_mentions = all_mentions.drop_duplicates(subset='post_id')
    all_mentions = all_mentions.sort_values('timestamp', ascending=False)
    
    print(f"Found {len(all_mentions)} mentions")
    return all_mentions

if __name__ == "__main__":
    mentions_df = main()
    print("\nMost recent mentions:")
    print(mentions_df[['title', 'subreddit', 'upvotes', 'timestamp']].head())
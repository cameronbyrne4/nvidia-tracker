from fastapi import HTTPException
import requests
from datetime import datetime, timedelta
from config import ALPHA_VANTAGE_API_KEY
import json
from pathlib import Path

# Cache settings
CACHE_FILE = "stock_cache.json"
CACHE_DURATION = timedelta(hours=1)

def load_cache():
    try:
        if Path(CACHE_FILE).exists():
            with open(CACHE_FILE, 'r') as f:
                cache = json.load(f)
                if datetime.fromisoformat(cache['timestamp']) + CACHE_DURATION > datetime.now():
                    return cache['data']
    except Exception:
        pass
    return None

def save_cache(data):
    cache = {
        'timestamp': datetime.now().isoformat(),
        'data': data
    }
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f)

async def get_stock_data():
    try:
        # Check cache first
        cached_data = load_cache()
        if cached_data:
            return cached_data

        url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=NVDA&apikey={ALPHA_VANTAGE_API_KEY}&outputsize=compact'
        response = requests.get(url)
        data = response.json()

        if "Time Series (Daily)" not in data:
            raise HTTPException(status_code=500, detail="Invalid API response")

        daily_data = data["Time Series (Daily)"]
        formatted_data = []

        for date, values in daily_data.items():
            formatted_data.append({
                "date": date,
                "open": values["1. open"],
                "high": values["2. high"],
                "low": values["3. low"],
                "close": values["4. close"],
                "volume": values["5. volume"]
            })

        # Sort by date ascending
        formatted_data.sort(key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"))
        result = formatted_data[-100:]  # Return last 100 days
        
        # Save to cache
        save_cache(result)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
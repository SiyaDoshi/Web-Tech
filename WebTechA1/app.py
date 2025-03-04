from flask import Flask, send_from_directory, request, jsonify
import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

ARTSY_AUTH_URL = "https://api.artsy.net/api/tokens/xapp_token"
ARTSY_SEARCH_URL = "https://api.artsy.net/api/search"
ARTSY_ARTIST_URL = "https://api.artsy.net/api/artists"

artsy_token = None
token_expiry = 0  

def get_artsy_token():
    global artsy_token, token_expiry
    try:
        print("Fetching new Artsy token - ")
        auth_payload = {"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
        response = requests.post(ARTSY_AUTH_URL, json=auth_payload)

        if response.status_code in [200, 201]:  
            data = response.json()
            artsy_token = data.get("token")
            token_expiry = time.time() + (7 * 24 * 60 * 60)  

            if artsy_token:
                print("New Artsy Token Fetched")
                return artsy_token
            else:
                return None

        print("Failed to fetch Artsy token. Status Code: {response.status_code}, Response: {response.text}")
        return None

    except Exception as e:
        print("Exception while fetching token: {e}")
        return None

def ensure_valid_token():
    global artsy_token, token_expiry
    if artsy_token is None or time.time() >= token_expiry:
        get_artsy_token()


app = Flask(__name__, static_folder="static", template_folder="template")

@app.route('/')
def home():
    return send_from_directory("template", "index.html")

@app.route('/search')
def search():
    ensure_valid_token()

    query = request.args.get('q')
    if not query:
        return jsonify([])

    headers = {"X-Xapp-Token": artsy_token}
    params = {"q": query, "size": 10, "type": "artist"}  

    response = requests.get(ARTSY_SEARCH_URL, headers=headers, params=params)

    print("Search query received by flask: {query}")
    print("Artsy API Response: {response.status_code}")

    if response.status_code in [200, 201]:  
        data = response.json()

        results = data.get("_embedded", {}).get("results", [])

        if not results:
            print("No results found from Artsy API.")
            return jsonify([])

        formatted_results = []
        for item in results:
            if item.get("type") == "artist":  
                artist_id = item["_links"]["self"]["href"].split("/")[-1]
                image_url = item["_links"]["thumbnail"]["href"] if "thumbnail" in item["_links"] else "/static/images/artsy_logo.svg"

                formatted_results.append({
                    "id": artist_id,
                    "name": item["title"],
                    "image": image_url
                })

        print("Sending {len(formatted_results)} artists to frontend.")
        return jsonify(formatted_results)

    print("API returned an error: {response.status_code}")
    return jsonify([])

@app.route('/artist/<artist_id>')
def artist_details(artist_id):
    ensure_valid_token()

    headers = {"X-Xapp-Token": artsy_token}
    artist_url = f"{ARTSY_ARTIST_URL}/{artist_id}"

    response = requests.get(artist_url, headers=headers)

    print("Fetching details for artist ID: {artist_id}")

    if response.status_code == 200:
        data = response.json()
       
        artist_details = {
           "name": data.get("name", "Unknown Artist"),
            "image": data["_links"]["thumbnail"]["href"] if "thumbnail" in data["_links"] else "/static/images/artsy_logo.svg",
            "biography": data.get("biography", "No biography available."),
            "birthday": data.get("birthday", "Unknown"),  
            "deathday": data.get("deathday", "Present"),
            "nationality": data.get("nationality", "Not available")
            
        }
        return jsonify(artist_details)

    return jsonify({"error": "Artist not found"}), 404

if __name__ == '__main__':
    get_artsy_token()  
    app.run(debug=True)

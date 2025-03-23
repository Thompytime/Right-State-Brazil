import requests
from bs4 import BeautifulSoup
import os
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import urllib.parse

# List of Brazilian states with correct spellings
brazilian_states = [
    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará",
    "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso",
    "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
    "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro",
    "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
    "Roraima", "Santa Catarina", "São Paulo", "Sergipe",
    "Tocantins", "Distrito Federal"
]

# Set up session with retries and User-Agent
session = requests.Session()
session.headers.update({
    'User-Agent': 'BrazilianStatesSVGScraper/1.0 (Contact: your-email@example.com)'
})
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["HEAD", "GET", "OPTIONS"]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("https://", adapter)

def get_svg_url(state_name):
    url_state_name = urllib.parse.quote(state_name.replace(" ", "_"))
    url_patterns = [
        f"https://en.wikipedia.org/wiki/{url_state_name}",
        f"https://en.wikipedia.org/wiki/{url_state_name}_(state)"
    ]
    
    special_cases = {
        "Distrito Federal": "https://en.wikipedia.org/wiki/Federal_District_(Brazil)",
    }
    
    if state_name in special_cases:
        url_patterns = [special_cases[state_name]]
    
    for url in url_patterns:
        print(f"Trying URL: {url}")
        try:
            response = session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            infobox = soup.find('table', class_=['infobox', 'infobox_v2', 'infobox_geography'])
            if not infobox:
                print(f"No infobox found for {state_name} at {url}")
                continue
                
            img_links = infobox.find_all('a', href=True)
            for link in img_links:
                href = link['href']
                if href.endswith('_in_Brazil.svg'):
                    img_page_url = "https://en.wikipedia.org" + href
                    print(f"Found image page: {img_page_url}")
                    
                    img_response = session.get(img_page_url, timeout=10)
                    img_response.raise_for_status()
                    img_soup = BeautifulSoup(img_response.text, 'html.parser')
                    
                    original_file = img_soup.find('div', class_='fullMedia')
                    if original_file:
                        svg_url = original_file.find('a')['href']
                        full_svg_url = "https:" + svg_url
                        print(f"Found SVG URL: {full_svg_url}")
                        return full_svg_url
            print(f"No suitable SVG found in infobox for {state_name} at {url}")
            continue
            
        except requests.RequestException as e:
            if isinstance(e.response, requests.Response) and e.response.status_code == 404:
                print(f"404 error for {url}, trying next pattern")
                continue
            print(f"Error fetching {state_name} at {url}: {e}")
            return None
    print(f"Could not find valid page with SVG for {state_name}")
    return None

def download_svg(url, state_name):
    if not url:
        print(f"No URL to download for {state_name}")
        return
    
    try:
        if not os.path.exists('brazilian_states_svgs'):
            os.makedirs('brazilian_states_svgs')
        
        filename = state_name.replace(" ", "_") + ".svg"
        filepath = os.path.join('brazilian_states_svgs', filename)
        
        print(f"Attempting to download {url} to {filepath}")
        response = session.get(url, timeout=10)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"Successfully downloaded: {filename}")
        
    except requests.RequestException as e:
        print(f"Error downloading {state_name}: {e}")

def main():
    for state in brazilian_states:
        print(f"\nProcessing {state}...")
        svg_url = get_svg_url(state)
        download_svg(svg_url, state)
        time.sleep(1)

if __name__ == "__main__":
    try:
        import bs4
    except ImportError:
        os.system('pip install beautifulsoup4')
    try:
        import requests
    except ImportError:
        os.system('pip install requests')
    
    main()
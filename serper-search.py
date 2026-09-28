"""
Fetch Google SERP data from Serper.dev and print organic results
plus People Also Ask questions.

Usage:
  python serper-search.py
"""

import requests

# Paste your Serper API key here (from https://serper.dev/api-key)
SERPER_API_KEY = "160fce216138978cf21edf3ffac6d5868c55aa29"

SERPER_SEARCH_URL = "https://google.serper.dev/search"


def fetch_search_data(keyword: str) -> dict:
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {"q": keyword, "num": 10}

    response = requests.post(SERPER_SEARCH_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def print_organic(results: list) -> None:
    print()
    print("=" * 72)
    print("  ORGANIC RESULTS (what's currently ranking)")
    print("=" * 72)

    if not results:
        print("\n  No organic results returned for this query.")
        return

    for item in results:
        position = item.get("position", "?")
        title = item.get("title", "(no title)")
        link = item.get("link", "")
        snippet = item.get("snippet", "(no snippet)")

        print(f"\n  [{position}] {title}")
        if link:
            print(f"      {link}")
        print(f"      {snippet}")


def print_people_also_ask(questions: list) -> None:
    print()
    print("=" * 72)
    print("  PEOPLE ALSO ASK (real questions people type into Google)")
    print("=" * 72)

    if not questions:
        print("\n  Google did not show a People Also Ask box for this query.")
        return

    for i, item in enumerate(questions, start=1):
        question = item.get("question", "(no question)")
        snippet = item.get("snippet", "")

        print(f"\n  {i}. {question}")
        if snippet:
            print(f"     {snippet}")


def main() -> None:
    if not SERPER_API_KEY or SERPER_API_KEY == "YOUR_SERPER_API_KEY":
        print("Add your Serper API key to SERPER_API_KEY at the top of this file.")
        return

    keyword = "how to start ai automation agency"



    print(f"\nSearching Serper for: {keyword}")

    try:
        data = fetch_search_data(keyword)
    except requests.HTTPError as exc:
        print(f"\nSerper request failed: {exc}")
        if exc.response is not None:
            print(exc.response.text)
        return
    except requests.RequestException as exc:
        print(f"\nCould not reach Serper: {exc}")
        return

    print_organic(data.get("organic", []))
    print_people_also_ask(data.get("peopleAlsoAsk", []))
    print()


if __name__ == "__main__":
    main()

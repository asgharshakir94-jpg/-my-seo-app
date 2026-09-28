import axios from "axios";

async function getGoogleSuggestions(seedKeyword) {
  try {
    const url = "https://suggestqueries.google.com/complete/search";
    const response = await axios.get(url, {
      params: {
        client: "firefox",
        q: seedKeyword,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // Firefox client returns: [seed, [suggestion, ...], ...]
    const suggestions = response.data[1];

    console.log(`\nReal-time Google variations for "${seedKeyword}":`);

    if (!suggestions || suggestions.length === 0) {
      console.log("No variations returned by Google.");
      return;
    }

    suggestions.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
  } catch (error) {
    console.error("Error fetching data from Google API:", error.message);
  }
}

getGoogleSuggestions("roof repair Houston");

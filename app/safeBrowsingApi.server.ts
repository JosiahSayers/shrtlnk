const apiKey = process.env.SAFE_BROWSING_API_KEY;
if (!apiKey) throw new Error("SAFE_BROWSING_API_KEY not defined");
const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

export const isUrlSafe = async (url: string): Promise<boolean> => {
  try {
    const request = createRequest(url);
    const res = await fetch(apiUrl, {
      body: JSON.stringify(request),
      method: "POST",
    });
    const resData: Response = await res.json();

    return (
      !resData.matches ||
      (Array.isArray(resData.matches) && resData.matches.length > 0)
    );
  } catch (e) {
    console.error("Failed to check Safe Browsing API", e);
    return true;
  }
};

function createRequest(url: string) {
  return {
    client: {
      clientId: "shrtlnk - Josiah Sayers - shrtlnk.dev",
      clientVersion: "1.0.0",
    },
    threatInfo: {
      threatTypes: [
        "THREAT_TYPE_UNSPECIFIED",
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["THREAT_ENTRY_TYPE_UNSPECIFIED", "URL"],
      threatEntries: { url },
    },
  };
}

type Response = {
  matches: any[];
};

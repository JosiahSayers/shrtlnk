import { logger } from "~/utils/logger.server";

const apiKey = process.env.SAFE_BROWSING_API_KEY;
if (!apiKey) throw new Error("SAFE_BROWSING_API_KEY not defined");
const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

export const getUrlBatchResponses = async (
  urls: string[]
): Promise<SafeBrowsingApiResponse | null> => {
  try {
    const request = createRequest(urls);
    const res = await fetch(apiUrl, {
      body: JSON.stringify(request),
      method: "POST",
    });
    if (res.status === 400) {
      logger.log("Gota 400 response from getUrlBatchResponses", {
        urls,
        request,
      });
    }
    return res.json();
  } catch (e) {
    logger.error("Failed to check Safe Browsing API", e);
    return null;
  }
};

export const isUrlSafe = async (url: string): Promise<boolean> => {
  try {
    const request = createRequest(url);
    const res = await fetch(apiUrl, {
      body: JSON.stringify(request),
      method: "POST",
    });
    const resData: SafeBrowsingApiResponse = await res.json();
    return (
      !resData.matches ||
      (Array.isArray(resData.matches) && resData.matches.length === 0)
    );
  } catch (e) {
    logger.error("Failed to check Safe Browsing API", e);
    return true;
  }
};

function createRequest(url: string | string[]) {
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
      threatEntries: Array.isArray(url)
        ? url.map((u) => ({ url: u }))
        : [{ url }],
    },
  };
}

export type SafeBrowsingApiResponse = {
  matches: ThreatMatch[];
};

export type ThreatMatch = {
  threatType: string;
  platformType: string;
  threat: {
    url: string;
  };
  cacheDuration: string;
  threatEntryType: string;
};

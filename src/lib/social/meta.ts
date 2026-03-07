/**
 * Meta Graph API client for Instagram Business + Facebook Page
 *
 * Instagram Graph API: https://developers.facebook.com/docs/instagram-api
 * Facebook Page API: https://developers.facebook.com/docs/pages
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

interface InstagramProfile {
  id: string;
  name: string;
  username: string;
  profile_picture_url?: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  biography?: string;
}

interface FacebookPage {
  id: string;
  name: string;
  fan_count: number;
  followers_count: number;
  picture?: { data: { url: string } };
  category?: string;
}

interface InsightsData {
  impressions: number;
  reach: number;
  profile_views: number;
}

interface MediaItem {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

// ---- Instagram Business Account ----

export async function getInstagramProfile(
  accessToken: string,
  igUserId?: string
): Promise<InstagramProfile | null> {
  try {
    // If no IG user ID, discover it from the token
    const userId = igUserId || (await discoverInstagramUserId(accessToken));
    if (!userId) return null;

    const res = await fetch(
      `${GRAPH_API_BASE}/${userId}?fields=id,name,username,profile_picture_url,followers_count,follows_count,media_count,biography&access_token=${accessToken}`
    );
    const data = await res.json();
    if ((data as MetaApiError).error) {
      console.error("Instagram profile error:", (data as MetaApiError).error.message);
      return null;
    }
    return data as InstagramProfile;
  } catch (err) {
    console.error("Instagram profile fetch failed:", err);
    return null;
  }
}

export async function getInstagramInsights(
  accessToken: string,
  igUserId: string,
  period: "day" | "week" | "days_28" = "day"
): Promise<InsightsData> {
  const defaults = { impressions: 0, reach: 0, profile_views: 0 };
  try {
    const metrics = "impressions,reach,profile_views";
    const res = await fetch(
      `${GRAPH_API_BASE}/${igUserId}/insights?metric=${metrics}&period=${period}&access_token=${accessToken}`
    );
    const data = await res.json();
    if ((data as MetaApiError).error) {
      console.error("Instagram insights error:", (data as MetaApiError).error.message);
      return defaults;
    }

    const result = { ...defaults };
    for (const metric of data.data || []) {
      const value = metric.values?.[0]?.value || 0;
      if (metric.name === "impressions") result.impressions = value;
      if (metric.name === "reach") result.reach = value;
      if (metric.name === "profile_views") result.profile_views = value;
    }
    return result;
  } catch {
    return defaults;
  }
}

export async function getInstagramMedia(
  accessToken: string,
  igUserId: string,
  limit = 10
): Promise<MediaItem[]> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
    );
    const data = await res.json();
    if ((data as MetaApiError).error) return [];
    return (data.data || []) as MediaItem[];
  } catch {
    return [];
  }
}

// ---- Facebook Page ----

export async function getFacebookPage(
  accessToken: string,
  pageId?: string
): Promise<FacebookPage | null> {
  try {
    const id = pageId || (await discoverFacebookPageId(accessToken));
    if (!id) return null;

    const res = await fetch(
      `${GRAPH_API_BASE}/${id}?fields=id,name,fan_count,followers_count,picture,category&access_token=${accessToken}`
    );
    const data = await res.json();
    if ((data as MetaApiError).error) {
      console.error("Facebook page error:", (data as MetaApiError).error.message);
      return null;
    }
    return data as FacebookPage;
  } catch (err) {
    console.error("Facebook page fetch failed:", err);
    return null;
  }
}

export async function getFacebookPageInsights(
  accessToken: string,
  pageId: string,
  period: "day" | "week" | "days_28" = "day"
): Promise<InsightsData> {
  const defaults = { impressions: 0, reach: 0, profile_views: 0 };
  try {
    const metrics = "page_impressions,page_post_engagements,page_views_total";
    const res = await fetch(
      `${GRAPH_API_BASE}/${pageId}/insights?metric=${metrics}&period=${period}&access_token=${accessToken}`
    );
    const data = await res.json();
    if ((data as MetaApiError).error) return defaults;

    const result = { ...defaults };
    for (const metric of data.data || []) {
      const value = metric.values?.[0]?.value || 0;
      if (metric.name === "page_impressions") result.impressions = value;
      if (metric.name === "page_post_engagements") result.reach = value;
      if (metric.name === "page_views_total") result.profile_views = value;
    }
    return result;
  } catch {
    return defaults;
  }
}

// ---- Helpers ----

async function discoverInstagramUserId(accessToken: string): Promise<string | null> {
  try {
    // Get pages the token has access to, then find connected IG account
    const res = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=id,instagram_business_account&access_token=${accessToken}`
    );
    const data = await res.json();
    for (const page of data.data || []) {
      if (page.instagram_business_account?.id) {
        return page.instagram_business_account.id;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function discoverFacebookPageId(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=id,name&access_token=${accessToken}`
    );
    const data = await res.json();
    return data.data?.[0]?.id || null;
  } catch {
    return null;
  }
}

/**
 * Validate a Meta access token by attempting to fetch basic info
 */
export async function validateToken(accessToken: string): Promise<{
  valid: boolean;
  platform: "instagram" | "facebook" | null;
  accountName: string;
  accountId: string;
  profilePicture: string;
  followers: number;
}> {
  // Try Instagram first
  const igProfile = await getInstagramProfile(accessToken);
  if (igProfile) {
    return {
      valid: true,
      platform: "instagram",
      accountName: igProfile.username || igProfile.name,
      accountId: igProfile.id,
      profilePicture: igProfile.profile_picture_url || "",
      followers: igProfile.followers_count,
    };
  }

  // Try Facebook page
  const fbPage = await getFacebookPage(accessToken);
  if (fbPage) {
    return {
      valid: true,
      platform: "facebook",
      accountName: fbPage.name,
      accountId: fbPage.id,
      profilePicture: fbPage.picture?.data?.url || "",
      followers: fbPage.followers_count || fbPage.fan_count,
    };
  }

  return {
    valid: false,
    platform: null,
    accountName: "",
    accountId: "",
    profilePicture: "",
    followers: 0,
  };
}

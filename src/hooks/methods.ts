import { parseQueryString } from "../provider/common";
import { fetchGet, fetchPost } from "../provider/fetch";
import { TWITCH_EVENT_SUBSCRIBE_URL, TWITCH_USER_URL } from "./constants";

export type TwitchOauthLoginState = {
  access_token: string;
  scope: string;
  token_type: string;
};

export type TwitchUserState = {
  id: string;
  broadcaster_type: string;
  created_at: string;
  description: string;
  display_name: string;
  login: string;
  offline_image_url: string;
  profile_image_url: string;
  type: string;
  view_count: number;
};

// Basic methods
export function openTwitchOauthLogin(client_id: string, redirect_uri: string) {
  const scope = [
    "user:read:chat",
    "user:bot",
    "channel:bot",
    "channel:read:subscriptions",
    "channel:read:redemptions",
  ].join("+");
  const params = `response_type=token&force_verify=true&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
  window.location.href = `https://id.twitch.tv/oauth2/authorize?${params}`;
}

export function getTwitchLoginStateFromQueryString():
  | TwitchOauthLoginState
  | undefined {
  const queryString = window.location.href.split("#")[1];
  if (typeof queryString !== "undefined") {
    const result = parseQueryString<TwitchOauthLoginState>(queryString);
    return result;
  }
}

export async function getTwitchUserProfile(
  client_id: string,
  user_token: string,
): Promise<TwitchUserState | undefined> {
  const headers = {
    "Client-ID": client_id,
    Authorization: `Bearer ${user_token}`,
  };

  const result = await fetchGet(TWITCH_USER_URL, headers);
  if (result) {
    return result.data[0];
  }
}

// Websocket methods
export const subscribeMessageForWs = async (
  ws_session_id: string,
  client_id: string,
  user_token: string,
  user_id: string,
) => {
  const url = TWITCH_EVENT_SUBSCRIBE_URL;
  const data = {
    type: "channel.chat.message",
    version: "1",
    condition: { broadcaster_user_id: user_id, user_id: user_id },
    transport: { method: "websocket", session_id: ws_session_id },
  };

  const header = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user_token}`,
    "Client-Id": client_id,
  };

  try {
    await fetchPost(url, header, data);
    return true;
  } catch (err) {
    return false;
  }
};

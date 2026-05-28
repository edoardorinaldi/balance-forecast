const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let _accessToken: string | null = null;
let _tokenExpiry = 0;

export const getAccessToken = (): string | null => {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;
  return null;
};

export const signIn = (onSuccess: () => void, onError: () => void): void => {
  const g = (window as any).google;
  if (!g?.accounts?.oauth2) {
    onError();
    return;
  }
  const client = g.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.error) {
        onError();
        return;
      }
      _accessToken = response.access_token;
      // Subtract 60s so we refresh before actual expiry
      _tokenExpiry = Date.now() + (response.expires_in - 60) * 1000;
      onSuccess();
    },
  });
  client.requestAccessToken({ prompt: "select_account" });
};

export const signOut = (): void => {
  if (_accessToken) {
    (window as any).google?.accounts?.oauth2?.revoke(_accessToken);
  }
  _accessToken = null;
  _tokenExpiry = 0;
};

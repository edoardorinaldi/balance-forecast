const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const LS_TOKEN = "gauth_token";
const LS_EXPIRY = "gauth_expiry";

let _accessToken: string | null = null;
let _tokenExpiry = 0;

// Restore session from localStorage on module load
const _stored = localStorage.getItem(LS_TOKEN);
const _storedExpiry = Number(localStorage.getItem(LS_EXPIRY) ?? 0);
if (_stored && Date.now() < _storedExpiry) {
  _accessToken = _stored;
  _tokenExpiry = _storedExpiry;
}

export const isSignedIn = (): boolean =>
  !!_accessToken && Date.now() < _tokenExpiry;

export const getAccessToken = (): string | null => {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;
  return null;
};

export const signIn = (onSuccess: () => void, onError: (msg?: string) => void): void => {
  if (!CLIENT_ID) {
    onError("Google Client ID is not configured.");
    return;
  }
  const g = (window as any).google;
  if (!g?.accounts?.oauth2) {
    onError("Google sign-in library not loaded. Please refresh and try again.");
    return;
  }
  try {
    const client = g.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          onError(`Sign-in error: ${response.error}`);
          return;
        }
        _accessToken = response.access_token;
        _tokenExpiry = Date.now() + (response.expires_in - 60) * 1000;
        localStorage.setItem(LS_TOKEN, _accessToken!);
        localStorage.setItem(LS_EXPIRY, String(_tokenExpiry));
        onSuccess();
      },
    });
    client.requestAccessToken({ prompt: "select_account" });
  } catch (err: any) {
    onError(err?.message ?? "Sign-in failed. Please try again.");
  }
};

export const signOut = (): void => {
  if (_accessToken) {
    (window as any).google?.accounts?.oauth2?.revoke(_accessToken);
  }
  _accessToken = null;
  _tokenExpiry = 0;
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_EXPIRY);
};

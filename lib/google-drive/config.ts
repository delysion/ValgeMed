export type GoogleDriveConfigIssue =
  | "missing_client_id"
  | "missing_api_key"
  | "missing_app_id"
  | "origin_not_allowed";

export type GoogleDriveConfigInput = {
  clientId?: string;
  appId?: string;
  apiKey?: string;
  allowedOrigins?: string;
  currentOrigin?: string;
};

export function getGoogleDriveScope() {
  return "https://www.googleapis.com/auth/drive.file";
}

export function splitGoogleDriveAllowedOrigins(value?: string) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function clean(value?: string) {
  const cleaned = value?.trim();
  return cleaned && !/^your-|^placeholder$/i.test(cleaned) ? cleaned : "";
}

function deriveAppIdFromClientId(clientId: string) {
  const match = clientId.match(/^(\d+)-/);
  return match?.[1] ?? "";
}

export function getGoogleDriveConfig(input: GoogleDriveConfigInput) {
  const clientId = clean(input.clientId);
  const appId = clean(input.appId) || deriveAppIdFromClientId(clientId);
  const apiKey = clean(input.apiKey);
  const allowedOrigins = splitGoogleDriveAllowedOrigins(input.allowedOrigins);
  const currentOrigin = input.currentOrigin?.trim();
  let issue: GoogleDriveConfigIssue | null = null;

  if (!clientId) {
    issue = "missing_client_id";
  } else if (!apiKey) {
    issue = "missing_api_key";
  } else if (!appId) {
    issue = "missing_app_id";
  } else if (currentOrigin && allowedOrigins.length > 0 && !allowedOrigins.includes(currentOrigin)) {
    issue = "origin_not_allowed";
  }

  return {
    clientId,
    appId,
    apiKey,
    allowedOrigins,
    currentOrigin,
    issue,
    ready: issue === null,
  };
}

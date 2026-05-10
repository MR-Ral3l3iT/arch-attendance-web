function readPublicEnv(name: string): string {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : "";
}

/** Configure download links via env (optional). Empty = show “coming soon” state. */
export const landingDownloads = {
  androidPlayUrl: readPublicEnv("NEXT_PUBLIC_ANDROID_PLAY_URL"),
  androidApkUrl: readPublicEnv("NEXT_PUBLIC_ANDROID_APK_URL"),
  iosAppStoreUrl: readPublicEnv("NEXT_PUBLIC_IOS_APP_STORE_URL"),
  iosTestFlightUrl: readPublicEnv("NEXT_PUBLIC_IOS_TESTFLIGHT_URL"),
} as const;

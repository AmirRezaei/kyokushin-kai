const IN_APP_BROWSER_REGEX = /(FBAN|FBAV|FB_IAB|Instagram)/i;

// Meta's manual login flow redirects back to the same user agent via redirect_uri.
// In-app browsers (Facebook/Instagram) can switch to a separate webview, so the
// original tab never receives the callback; warn users to use the system browser.
export function isLikelyInAppBrowser(userAgent: string = navigator.userAgent): boolean {
  return IN_APP_BROWSER_REGEX.test(userAgent);
}

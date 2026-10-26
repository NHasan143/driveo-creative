/** Photos uploaded in the content admin live on the API (absolute URLs) and skip Next.js optimisation. */
export function isRemoteImage(src: string) {
  return /^https?:\/\//.test(src);
}

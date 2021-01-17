const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

/**
 * Given an image retutn the Url
 * Works for local or deployed strapis
 * @param {any} image
 */
export const fromImageToUrl = (image) => {
  if (!image) {
    return '/vercel.svg';
  }

  // If image.url's first character '/', that means relative path
  if (image.url.indexOf('/') === 0) {
    return `${API_URL}${image.url}`;
  }

  return image.url;
};
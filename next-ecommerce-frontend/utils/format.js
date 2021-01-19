/**
 * show number in two decimals
 * @param {number | string} number
 */
export const twoDecimals = (number) => parseFloat(number).toFixed(2);

/**
 * get username from email
 * @param {string} email
 */
export const emailToUserName = (email) => {
  const nameParts = email.split('@');
  const name = nameParts.length === 2 ? nameParts[0] : email;

  return name;
};

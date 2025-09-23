<<<<<<< HEAD
export function getFormattedDate(date = new Date(), format = 'DD.MM.YYYY') {
  if (!date) {
    return ''
  }

  if (typeof date === 'string') {
    date = new Date(Date.parse(date));
  }

=======
export function getFormattedDate(format = 'DD.MM.YYYY', date = new Date()) {
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const shortYear = year.toString().slice(-2);

  let formattedDate = format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", year)
    .replace("YY", shortYear);

  return formattedDate;
}
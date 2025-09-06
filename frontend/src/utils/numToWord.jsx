function numberToWords(num) {
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
    'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
    'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
    'nineteen'
  ];
  const b = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty',
    'sixty', 'seventy', 'eighty', 'ninety'
  ];

  function convertNumber(n) {
    if (n === 0) return '';
    if (n.toString().length > 9) return 'overflow';

    let str = '';
    let x = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d)(\d{2})$/);
    if (!x) return '';

    str += (x[1] != '00') ? (a[+x[1]] || (b[x[1][0]] + ' ' + a[x[1][1]])) + ' crore ' : '';
    str += (x[2] != '00') ? (a[+x[2]] || (b[x[2][0]] + ' ' + a[x[2][1]])) + ' lakh ' : '';
    str += (x[3] != '00') ? (a[+x[3]] || (b[x[3][0]] + ' ' + a[x[3][1]])) + ' thousand ' : '';
    str += (x[4] != '0') ? (a[+x[4]] + ' hundred ') : '';
    str += (x[5] != '00')
      ? ((str != '') ? 'and ' : '') +
        (a[+x[5]] || (b[x[5][0]] + ' ' + a[x[5][1]])) + ' '
      : '';
    return str.trim();
  }

  let [rupees, paise] = num.toString().split(".");
  rupees = parseInt(rupees, 10);
  paise = paise ? parseInt(paise.padEnd(2, "0").slice(0, 2), 10) : 0;

  let result = "";
  if (rupees > 0) {
    result +=  convertNumber(rupees);
  }
  if (paise > 0) {
    result += (result ? " and " : "") + convertNumber(paise) + " paise";
  }

  return result.trim() + " only";
}
export default numberToWords;

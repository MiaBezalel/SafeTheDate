export function strReplaceAt(
  strToReplaceAt: string,
  index: number,
  replacement: string
) {
  return (
    strToReplaceAt.substring(0, index) +
    replacement +
    strToReplaceAt.substring(index + replacement.length)
  );
}

export function getAllIndexesOf(str: string, searchString: string) {
  const indexes: number[] = [];
  let i: number;
  while (
    (i = str.indexOf(searchString, indexes[indexes.length - 1] + 1 ?? 0)) != -1
  ) {
    console.log(i);
    indexes.push(i);
  }
  return indexes;
}

// IMPORTANT: Given same args will return the same masked string
export function maskString(
  strToCover: string,
  maskChar: "*" | "#" = "*",
  mustVisibleChars: string[]
) {
  let maskedStr = maskChar.repeat(strToCover.length);
  // Starting at 0 -> Always show first character
  let showCharIndex = 0;

  // Show must visible characters
  for (const c of mustVisibleChars) {
    let indexes = getAllIndexesOf(strToCover, c);
    for (const i of indexes) {
      maskedStr = strReplaceAt(maskedStr, i, c);
    }
  }

  while (showCharIndex < strToCover.length) {
    maskedStr = strReplaceAt(
      maskedStr,
      showCharIndex,
      strToCover[showCharIndex]
    );

    showCharIndex = Math.ceil((showCharIndex + 1) * 1.5);
  }
  return maskedStr;
}

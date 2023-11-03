function shortenText(maxLength: number, text: string | null) {
  if (text === null) {
    return null;
  }

  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }

  return text;
}

export default shortenText;

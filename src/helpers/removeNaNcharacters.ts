export function removeNaNCharacters(value: string) {
  return value.replace(/\D+/g, "");
}

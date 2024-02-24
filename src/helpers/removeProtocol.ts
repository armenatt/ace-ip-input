export function removeProtocol(value: string) {
  if (!value) {
    return "";
  }

  return value.replace(/(^\w+:|^)\/\//, "");
}

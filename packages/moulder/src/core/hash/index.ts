export const generateHash = () => {
  const chars = 'abcdefABCDEF0123456789';
  let result = 'x01'; // version
  for (let i = 52; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

let initialHash = new URLSearchParams(window.location.search).get('hash');
if (!initialHash) {
  initialHash = generateHash();
}
export const regenerateHash = (newHash: string) => {
  initialHash = newHash;
};

export const hash = (): string => {
  return initialHash as string;
};

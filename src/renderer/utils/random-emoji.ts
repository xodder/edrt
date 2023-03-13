const range = (start: number, end: number) => {
  const inc = start < end ? 1 : -1;
  return Array.from(
    { length: Math.abs(start - end) + 1 },
    (_, i) => start + inc * i
  );
};

const emojis = [
  128513, 128591, 128640, 128704, 128641, 128709, 127757, 128359,
].reduce<string[]>((acc, x, i, entries) => {
  if (i % 2 === 1) return acc;
  return acc.concat(range(x, entries[i + 1]).map((s) => `&#${s};`));
}, []);

function randomEmoji() {
  return emojis[Math.round(Math.random() * emojis.length)];
}

export default randomEmoji;

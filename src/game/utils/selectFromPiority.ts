type TPiorityObject = {
  piority: number;
};

export function selectFromPiority<T extends TPiorityObject>(
  data: T[] | { [key: string]: T },
): T {
  const currentData = !Array.isArray(data) ? Object.values(data) : data;
  const sumPiority = currentData.reduce((a, b) => a + b.piority, 0);
  const randomPoint = sumPiority * Math.random();
  const allActionPoints = currentData.map((_data) =>
    Math.abs(_data.piority - randomPoint),
  );
  const closestPoint = Math.min(...allActionPoints);

  const candidateIndexes = allActionPoints
    .map((point, index) => point === closestPoint ? index : -1)
    .filter(index => index !== -1);

  const randomIdx = candidateIndexes[Math.floor(Math.random() * candidateIndexes.length)];
  return currentData[randomIdx];
}

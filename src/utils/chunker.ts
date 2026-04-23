// BLE MTU is ~185 bytes on iOS CoreBluetooth after overhead
const CHUNK_SIZE = 180;

export function encodeChunks(data: object): Buffer[] {
  const json = JSON.stringify(data);
  const bytes = Buffer.from(json, 'utf8');
  const chunks: Buffer[] = [];
  const total = Math.ceil(bytes.length / CHUNK_SIZE);

  for (let i = 0; i < total; i++) {
    const payload = bytes.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    // Header: 1 byte index, 1 byte total
    const chunk = Buffer.alloc(2 + payload.length);
    chunk.writeUInt8(i, 0);
    chunk.writeUInt8(total, 1);
    payload.copy(chunk, 2);
    chunks.push(chunk);
  }

  return chunks;
}

export function decodeChunks(chunks: Buffer[]): object {
  const sorted = [...chunks].sort((a, b) => a.readUInt8(0) - b.readUInt8(0));
  const parts = sorted.map(c => c.slice(2));
  const full = Buffer.concat(parts);
  return JSON.parse(full.toString('utf8'));
}

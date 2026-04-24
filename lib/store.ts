const memory = new Set<string>();

export async function hasUsedTx(txHash: string): Promise<boolean> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return memory.has(txHash);

  const res = await fetch(`${url}/get/tx:${txHash}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Could not check transaction store.');
  const json = await res.json();
  return Boolean(json.result);
}

export async function markTxUsed(txHash: string): Promise<void> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    memory.add(txHash);
    return;
  }

  const res = await fetch(`${url}/set/tx:${txHash}/used`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Could not save transaction as used.');
}

export type PaymentVerification = {
  valid: boolean;
  amountUsdt?: number;
  txHash: string;
  reason?: string;
};

type Fetcher = typeof fetch;

const USDT_TRC20_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

function eventValue(event: any): string {
  return String(event?.result?.value ?? event?.result?._value ?? '0');
}

function eventReceiver(event: any): string {
  return String(event?.result?.to ?? event?.result?._to ?? '').trim();
}

function eventContract(event: any): string {
  return String(event?.contract ?? event?.contract_address ?? event?.contractAddress ?? '').trim();
}

export async function verifyUsdtTrc20Payment(
  txHash: string,
  receiverWallet: string,
  fetcher: Fetcher = fetch,
): Promise<PaymentVerification> {
  const cleanTx = txHash.trim();
  if (!/^[a-fA-F0-9]{16,128}$/.test(cleanTx)) {
    return { valid: false, txHash: cleanTx, reason: 'Invalid transaction hash format.' };
  }

  const url = `https://api.trongrid.io/v1/transactions/${encodeURIComponent(cleanTx)}/events`;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (process.env.TRONGRID_API_KEY) headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY;

  const res = await fetcher(url, { headers, cache: 'no-store' } as RequestInit);
  if (!res.ok) {
    return { valid: false, txHash: cleanTx, reason: `Could not verify transaction yet. TronGrid returned ${res.status}.` };
  }

  const body = await res.json();
  const events = Array.isArray(body?.data) ? body.data : [];
  const transfer = events.find((event: any) => {
    const isTransfer = String(event?.event_name ?? event?.eventName ?? '').toLowerCase() === 'transfer';
    const confirmed = event?.confirmed !== false;
    const contract = eventContract(event);
    const to = eventReceiver(event);
    return isTransfer && confirmed && contract === USDT_TRC20_CONTRACT && to === receiverWallet;
  });

  if (!transfer) {
    return { valid: false, txHash: cleanTx, reason: 'No confirmed USDT TRC20 transfer to the receiver wallet was found.' };
  }

  const amountUsdt = Number(eventValue(transfer)) / 1_000_000;
  if (!Number.isFinite(amountUsdt) || amountUsdt < 1) {
    return { valid: false, txHash: cleanTx, amountUsdt, reason: 'Payment is less than 1 USDT.' };
  }

  return { valid: true, txHash: cleanTx, amountUsdt };
}

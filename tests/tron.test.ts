import { describe, expect, it } from 'vitest';
import { verifyUsdtTrc20Payment } from '../lib/tron';

const wallet = 'TBBR3P7L6F9Ta8miznGpEnF9emX9xqDLLr';
const usdtContract = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

describe('verifyUsdtTrc20Payment', () => {
  it('accepts confirmed USDT TRC20 transfer of at least 1 USDT to the wallet', async () => {
    const fetcher = async () => new Response(JSON.stringify({
      data: [{
        event_name: 'Transfer',
        confirmed: true,
        contract: usdtContract,
        result: { to: wallet, value: '1000000' }
      }]
    }));

    const result = await verifyUsdtTrc20Payment('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', wallet, fetcher as any);

    expect(result.valid).toBe(true);
    expect(result.amountUsdt).toBe(1);
  });

  it('rejects transfers below 1 USDT', async () => {
    const fetcher = async () => new Response(JSON.stringify({
      data: [{ event_name: 'Transfer', confirmed: true, contract: usdtContract, result: { to: wallet, value: '999999' } }]
    }));

    const result = await verifyUsdtTrc20Payment('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', wallet, fetcher as any);

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('less than 1 USDT');
  });

  it('rejects transfers to a different wallet', async () => {
    const fetcher = async () => new Response(JSON.stringify({
      data: [{ event_name: 'Transfer', confirmed: true, contract: usdtContract, result: { to: 'TDifferentWallet', value: '5000000' } }]
    }));

    const result = await verifyUsdtTrc20Payment('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', wallet, fetcher as any);

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('receiver');
  });
});

/**
 * Cryptographic Tamper-Evidence utility.
 * Computes deterministic SHA-256 digests over conversations, terms, and draft clauses
 * to preserve an audit trail and detect tampering without claiming non-verifiable blockchain guarantees.
 */

export async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple deterministic hash if subtle crypto is not available in unusual environments
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sim-' + Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Creates a normalized signature string representing the conversation and extracted agreement snapshot.
 */
export function generateAgreementSignaturePayload(
  rawText: string,
  partyA: string,
  partyB: string,
  scope: string,
  price: string,
  payment: string,
  delivery: string
): string {
  return [
    'dealproof-v1',
    rawText.trim().replace(/\r\n/g, '\n'),
    partyA.trim().toLowerCase(),
    partyB.trim().toLowerCase(),
    scope.trim().toLowerCase(),
    price.trim().toLowerCase(),
    payment.trim().toLowerCase(),
    delivery.trim().toLowerCase()
  ].join(':::');
}

import { createUnsecuredToken, decodeToken } from 'micro-stacks/crypto';
import base64url from './base64url';

const rawPrivateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
const rawPublicKey = '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479';
const sampleToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3N1ZWRBdCI6IjE0NDA3MTM0MTQuODUiLCJjaGFsbGVuZ2UiOiI3Y2Q5ZWQ1ZS1iYjBlLTQ5ZWEtYTMyMy1mMjhiZGUzYTA1NDkiLCJpc3N1ZXIiOnsicHVibGljS2V5IjoiMDNmZGQ1N2FkZWMzZDQzOGVhMjM3ZmU0NmIzM2VlMWUwMTZlZGE2YjU4NWMzZTI3ZWE2NjY4NmMyZWE1MzU4NDc5IiwiY2hhaW5QYXRoIjoiYmQ2Mjg4NWVjM2YwZTM4MzgwNDMxMTVmNGNlMjVlZWRkMjJjYzg2NzExODAzZmIwYzE5NjAxZWVlZjE4NWUzOSIsInB1YmxpY0tleWNoYWluIjoieHB1YjY2MU15TXdBcVJiY0ZRVnJRcjRRNGtQamFQNEpqV2FmMzlmQlZLalBkSzZvR0JheUU0NkdBbUt6bzVVRFBRZExTTTlEdWZaaVA4ZWF1eTU2WE51SGljQnlTdlpwN0o1d3N5UVZwaTJheHpaIiwiYmxvY2tjaGFpbmlkIjoicnlhbiJ9fQ.DUf6Rnw6FBKv4Q3y95RX7rR6HG_L1Va96ThcIYTycOf1j_bf9WleLsOyiZ-35Qfw7FgDnW7Utvz4sNjdWOSnhQ';
const sampleDecodedToken = {
  header: { typ: 'JWT', alg: 'ES256K' },
  payload: {
    issuedAt: '1440713414.85',
    challenge: '7cd9ed5e-bb0e-49ea-a323-f28bde3a0549',
    issuer: {
      publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479',
      chainPath: 'bd62885ec3f0e3838043115f4ce25eedd22cc86711803fb0c19601eeef185e39',
      publicKeychain:
        'xpub661MyMwAqRbcFQVrQr4Q4kPjaP4JjWaf39fBVKjPdK6oGBayE46GAmKzo5UDPQdLSM9DufZiP8eauy56XNuHicBySvZp7J5wsyQVpi2axzZ',
      blockchainid: 'ryan',
    },
  },
  signature:
    'oO7ROPKq3T3X0azAXzHsf6ub6CYy5nUUFDoy8MS22B3TlYisqsBrRtzWIQcSYiFXLytrXwAdt6vjehj3OFioDQ',
};

test('createUnsecuredToken', () => {
  const unsecuredToken = createUnsecuredToken(sampleDecodedToken.payload);
  expect(unsecuredToken).toBeTruthy();
  expect(unsecuredToken).toBe(
    base64url.encode(JSON.stringify({ typ: 'JWT', alg: 'none' })) +
      '.' +
      sampleToken.split('.')[1] +
      '.'
  );

  const decodedToken = decodeToken(unsecuredToken);
  expect(decodedToken).toBeTruthy();
});

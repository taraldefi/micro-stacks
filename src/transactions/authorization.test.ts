import {
  createMessageSignature,
  createMultiSigSpendingCondition,
  createSingleSigSpendingCondition,
  createTransactionAuthField,
  deserializeSpendingCondition,
  emptyMessageSignature,
  serializeSpendingCondition,
  SingleSigSpendingCondition,
} from './authorization';

import { AddressHashMode, PubKeyEncoding } from './common/constants';

import { createStacksPrivateKey, createStacksPublicKey, signWithKey } from './keys';
import { BufferReader, bytesToHex } from 'micro-stacks/common';

test('ECDSA recoverable signature', async () => {
  const privKeyString = 'edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc';
  const messagetoSign = 'eec72e6cd1ce0ac1dd1a0c260f099a8fc72498c80b3447f962fd5d39a3d70921';
  const correctSignature =
    '019901d8b1d67a7b853dc473d0609508ab2519ec370eabfef460aa0fd9234660' +
    '787970968562da9de8b024a7f36f946b2fdcbf39b2f59247267a9d72730f19276b';
  const privKey = createStacksPrivateKey(privKeyString);
  const messageSignature = await signWithKey(privKey, messagetoSign);
  expect(messageSignature.data).toBe(correctSignature);
});

test('Single spending condition serialization and deserialization', () => {
  const addressHashMode = AddressHashMode.SerializeP2PKH;
  const nonce = 0;
  const fee = 0;
  const pubKey = '03ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab';
  // const secretKey = 'edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc01';
  const spendingCondition = createSingleSigSpendingCondition(addressHashMode, pubKey, nonce, fee);
  const emptySignature = emptyMessageSignature();

  const serialized = serializeSpendingCondition(spendingCondition);
  const deserialized = deserializeSpendingCondition(
    new BufferReader(serialized)
  ) as SingleSigSpendingCondition;
  expect(deserialized.hashMode).toBe(addressHashMode);
  expect(deserialized.nonce!.toString()).toBe(nonce.toString());
  expect(deserialized.fee!.toString()).toBe(fee.toString());
  expect(deserialized.signature.data).toBe(emptySignature.data);
});

test('Single sig spending condition uncompressed', () => {
  const addressHashMode = AddressHashMode.SerializeP2PKH;
  const nonce = 123;
  const fee = 456;
  const pubKey = '';
  const spendingCondition = createSingleSigSpendingCondition(addressHashMode, pubKey, nonce, fee);
  spendingCondition.signer = '11'.repeat(20);
  spendingCondition.keyEncoding = PubKeyEncoding.Uncompressed;

  const signature = createMessageSignature('ff'.repeat(65));
  spendingCondition.signature = signature;

  const serializedSpendingCondition = serializeSpendingCondition(spendingCondition);

  // prettier-ignore
  const spendingConditionBytesHex = [
    // address hash mode
    AddressHashMode.SerializeP2PKH,
    // signer
    0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11,
    0x11, 0x11, 0x11, 0x11, 0x11,
    // nonce
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7b,
    // fee rate
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xc8,
    // key encoding,
    PubKeyEncoding.Uncompressed,
    // signature
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff
  ];
  const spendingConditionBytes = Uint8Array.from(spendingConditionBytesHex);

  expect(bytesToHex(serializedSpendingCondition)).toEqual(bytesToHex(spendingConditionBytes));
});

test('Multi sig spending condition uncompressed', () => {
  const addressHashMode = AddressHashMode.SerializeP2SH;
  const nonce = 123;
  const fee = 456;
  const pubKey = '02'.repeat(33);
  const pubKeys = [pubKey, pubKey, pubKey];

  const spendingCondition = createMultiSigSpendingCondition(
    addressHashMode,
    2,
    pubKeys,
    nonce,
    fee
  );
  spendingCondition.signer = '11'.repeat(20);

  const signature = createMessageSignature('ff'.repeat(65));
  const fields = [signature, signature, createStacksPublicKey(pubKeys[2])];
  spendingCondition.fields = fields.map(sig =>
    createTransactionAuthField(PubKeyEncoding.Compressed, sig)
  );

  const serializedSpendingCondition = serializeSpendingCondition(spendingCondition);

  // prettier-ignore
  const spendingConditionBytesHex = [
    // address hash mode
    AddressHashMode.SerializeP2SH,
    // signer
    0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11,
    0x11, 0x11, 0x11, 0x11, 0x11,
    // nonce
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7b,
    // fee rate
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xc8,
    // length prefixed list of fields
    0x00, 0x00, 0x00, 0x03,
    0x02, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff,
    0x02, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff,
    0x00, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02,
    // required signatures
    0x00, 0x02
  ];

  const spendingConditionBytes = Uint8Array.from(spendingConditionBytesHex);

  expect(bytesToHex(serializedSpendingCondition)).toEqual(bytesToHex(spendingConditionBytes));
});

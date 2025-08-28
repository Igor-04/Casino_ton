import 'dotenv/config';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { fromNano } from '@ton/core';

async function main() {
  const m = process.env.DEPLOYER_MNEMONIC;
  if (!m) throw new Error('DEPLOYER_MNEMONIC not set');

  const key = await mnemonicToPrivateKey(m.split(' '));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  const endpoint = await getHttpEndpoint({ network: 'testnet' });
  const client = new TonClient({ endpoint });

  const balance = await client.getBalance(wallet.address);
  console.log('Deployer:', wallet.address.toString());
  console.log('Balance :', fromNano(balance), 'TON (testnet)');
}
main().catch(e => { console.error(e); process.exit(1); });

import 'dotenv/config';
import { WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

async function main() {
  const m = process.env.DEPLOYER_MNEMONIC;
  if (!m) throw new Error('DEPLOYER_MNEMONIC not set');
  const key = await mnemonicToPrivateKey(m.split(' '));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  console.log('Deployer wallet address:', wallet.address.toString());
}
main();

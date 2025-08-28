import 'dotenv/config';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import {
  Address,
  beginCell,
  Cell,
  contractAddress,
  internal,
  toNano,
} from '@ton/core';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as fs from 'fs';

// ПУТЬ К ТВОЕМУ .boc (мы его нашли ранее командой dir /s /b *.boc)
const CODE_BOC = 'contracts/contracts/build/GameContract.tact_GameContract.code.boc';

// Если бы был отдельный data.boc — укажи путь; у нас его нет.
const DATA_BOC: string | null = null;

async function main() {
  const network = (process.env.NETWORK as 'mainnet' | 'testnet') ?? 'testnet';
  const endpoint = await getHttpEndpoint({ network });
  const client = new TonClient({ endpoint });

  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error('DEPLOYER_MNEMONIC not set');

  // Генерим ключи и кошелёк v4
  const key = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  const walletContract = client.open(wallet);

  console.log('Deployer wallet address:', wallet.address.toString());

  // ВАЖНО: на этом адресе должны быть тестовые TON (testnet)!
  // Иначе ни деплой кошелька, ни отправка сообщения не пройдут.

  // Загружаем код контракта
  const code = Cell.fromBoc(fs.readFileSync(CODE_BOC))[0];

  // Собираем init data по твоему init(admin, fee)
  const admin = wallet.address;
  const fee = toNano('0.05');
  const data =
    DATA_BOC ? Cell.fromBoc(fs.readFileSync(DATA_BOC))[0]
             : beginCell().storeAddress(admin).storeCoins(fee).endCell();

  // Формируем StateInit и адрес контракта
  const stateInit = { code, data };
  const address = contractAddress(0, stateInit);

  console.log('Calculated contract address:', address.toString());

  // Проверим, задеплоен ли контракт
  const isDeployed = await client.isContractDeployed(address);
  if (!isDeployed) {
    // Отправляем внутреннее сообщение С ПРИЛОЖЕННЫМ stateInit (init: { code, data })
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
      seqno,
      secretKey: key.secretKey,
      messages: [
        internal({
          to: address,
          value: toNano('0.25'), // немного запаса на газ
          init: stateInit,       // <-- КЛЮЧЕВОЕ: прикладываем StateInit
          body: new Cell(),      // payload не обязателен на деплой
        }),
      ],
    });

    // Ждём, пока уйдёт транзакция (seqno увеличится)
let targetSeqno = (await walletContract.getSeqno()) + 1;
for (let i = 0; i < 30; i++) {
  const s = await walletContract.getSeqno();
  if (s >= targetSeqno) break;
  await new Promise(r => setTimeout(r, 2000));
}

// Ждём, пока контракт появится на сети
for (let i = 0; i < 30; i++) {
  const ok = await client.isContractDeployed(address);
  if (ok) break;
  await new Promise(r => setTimeout(r, 2000));
}

  }

  console.log('Deployed at:', address.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

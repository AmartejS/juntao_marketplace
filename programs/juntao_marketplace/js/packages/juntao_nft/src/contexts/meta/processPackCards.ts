import { AccountInfo } from '@solana/web3.js';
import { PackKey } from '../../models/packs';
import { decodePackCard, PackCard } from '../../models/packs/accounts/PackCard';
import { PACK_CREATE_ID, pubkeyToString } from '../../utils/ids';
import { ParsedAccount } from '../../contexts/types';
import { ProcessAccountsFunc } from './types';

export const processPackCards: ProcessAccountsFunc = (
  { account, pubkey },
  setter,
) => {
  if (!isPackAccount(account)) return;

  try {
    if (isPackCardAccount(account)) {
      const packCard = decodePackCard(account.data);
      const parsedAccount: ParsedAccount<PackCard> = {
        pubkey,
        account: account,
        info: packCard,
      };

      setter('packCards', pubkey, parsedAccount);
      setter('packCardsByPackSet', packCard.packSet, parsedAccount);
    }
  } catch {
    // ignore errors
    // add type as first byte for easier deserialization
  }
};

const isPackAccount = (account: AccountInfo<Buffer>) =>
  account && pubkeyToString(account.owner) === PACK_CREATE_ID.toString();

const isPackCardAccount = (account: AccountInfo<Buffer>) =>
  account.data[0] === PackKey.PackCard;

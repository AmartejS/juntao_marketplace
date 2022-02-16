import { Keypair, TransactionInstruction } from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import {
  
  
  toPublicKey,
} from '../utils/ids';
import{ StringPublicKey,
} from '../utils/ids';

import {
  programIds,} from '../utils/programIds';
import {
  findProgramAddress,} from '../utils/utils'
import {createAssociatedTokenAccountInstruction,
  createMint,} from '../actions';

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

export async function createMintAndAccountWithOne(
  wallet: any,
  receiverWallet: StringPublicKey,
  mintRent: any,
  instructions: TransactionInstruction[],
  signers: Keypair[],
): Promise<{ mint: StringPublicKey; account: StringPublicKey }> {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const mint = createMint(
    instructions,
    wallet.publicKey,
    mintRent,
    0,
    wallet.publicKey,
    wallet.publicKey,
    signers,
  );

  const PROGRAM_IDS = programIds();

  const account: StringPublicKey = (
    await findProgramAddress(
      [
        toPublicKey(receiverWallet).toBuffer(),
        PROGRAM_IDS.token.toBuffer(),
        mint.toBuffer(),
      ],
      PROGRAM_IDS.associatedToken,
    )
  )[0];

  createAssociatedTokenAccountInstruction(
    instructions,
    toPublicKey(account),
    wallet.publicKey,
    toPublicKey(receiverWallet),
    mint,
  );

  instructions.push(
    Token.createMintToInstruction(
      PROGRAM_IDS.token,
      mint,
      toPublicKey(account),
      wallet.publicKey,
      [],
      1,
    ),
  );

  return { mint: mint.toBase58(), account };
}

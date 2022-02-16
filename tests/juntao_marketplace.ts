import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { JuntaoMarketplace } from '../target/types/juntao_marketplace';

describe('juntao_marketplace', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.JuntaoMarketplace as Program<JuntaoMarketplace>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});

import React, { FC } from 'react';

import {
 
  WalletProvider,
} from './common/wallet';
import{ AccountsProvider,} from './contexts/AccountContext'
import {ConnectionProvider} from './contexts/ConnectionContext'
import { MetaProvider,
  } from './contexts/meta/meta'
import {StoreProvider} from './contexts/store'
import { ConfettiProvider } from './components/Confetti';
import { AppLayout } from './components/Layout';
import { LoaderProvider } from './components/Loader';
import { CoingeckoProvider } from './contexts/coingecko';
import { SPLTokenListProvider } from './contexts/tokenList';
//import { findProgramAddress } from './utils/utils';

export const Providers: FC = ({ children }) => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <AccountsProvider>
          <SPLTokenListProvider>
            <CoingeckoProvider>
              <StoreProvider
                ownerAddress={process.env.NEXT_PUBLIC_STORE_OWNER_ADDRESS}
                storeAddress={process.env.NEXT_PUBLIC_STORE_ADDRESS}
              >
                <MetaProvider>
                  <LoaderProvider>
                    <ConfettiProvider>
                      <AppLayout>{children}</AppLayout>
                    </ConfettiProvider>
                  </LoaderProvider>
                </MetaProvider>
              </StoreProvider>
            </CoingeckoProvider>
          </SPLTokenListProvider>
        </AccountsProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

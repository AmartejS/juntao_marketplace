import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircleTwoTone,
  LoadingOutlined,
  PlayCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  
  StringPublicKey,
  toPublicKey,
  
  WRAPPED_SOL_MINT,
} from '../../utils/ids';
import {
  programIds,} from '../../utils/programIds';
import {useConnection,
  } from '../../contexts/connection';
import {useUserAccounts,
 } from  '../../hooks/useUserAccounts';
import { VaultState,
  } from '../../actions/vault'
import {WalletSigner} from '../../contexts/wallet';
import{findProgramAddress} from '../../utils/utils'
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { Badge, Popover, List } from 'antd';
import { Link } from 'react-router-dom';

import { useMeta } from '../../contexts';


interface NotificationCard {
  id: string;
  title: string;
  description: string | JSX.Element;
  action: () => Promise<boolean>;
  dismiss?: () => Promise<boolean>;
}

enum RunActionState {
  NotRunning,
  Running,
  Success,
  Failed,
}

function RunAction({
  id,
  action,
  onFinish,
  icon,
}: {
  id: string;
  action: () => Promise<boolean>;
  onFinish?: () => void;
  icon: JSX.Element;
}) {
  const [state, setRunState] = useState<RunActionState>(
    RunActionState.NotRunning,
  );

  useMemo(() => setRunState(RunActionState.NotRunning), [id]);

  const run = async () => {
    await setRunState(RunActionState.Running);
    const result = await action();
    if (result) {
      await setRunState(RunActionState.Success);
      setTimeout(() => (onFinish ? onFinish() : null), 2000); // Give user a sense of completion before removal from list
    } else {
      await setRunState(RunActionState.Failed);
    }
  };

  let component;
  switch (state) {
    case RunActionState.NotRunning:
      component = (
        <span className="hover-button" onClick={run}>
          {icon}
        </span>
      );
      break;
    case RunActionState.Failed:
      component = (
        <span className="hover-button" onClick={run}>
          <SyncOutlined />
        </span>
      );
      break;
    case RunActionState.Running:
      component = <LoadingOutlined />;
      break;
    case RunActionState.Success:
      component = <CheckCircleTwoTone twoToneColor="#52c41a" />;
  }

  return component;
}

export async function getPersonalEscrowAta(
  wallet: WalletSigner | undefined
): Promise<StringPublicKey | undefined> {
  const PROGRAM_IDS = programIds();
  if (!wallet?.publicKey) return;

  return (
    await findProgramAddress(
      [
        wallet.publicKey.toBuffer(),
        PROGRAM_IDS.token.toBuffer(),
       // QUOTE_MINT.toBuffer(),
      ],
      PROGRAM_IDS.associatedToken,
    )
  )[0];
}



const CALLING_MUTEX: Record<string, boolean> = {};

export function Notifications() {
  const {
    metadata,
    whitelistedCreatorsByCreator,
    store,
    vaults,
    safetyDepositBoxesByVaultAndIndex,
    pullAllSiteData,
  } = useMeta();
  const possiblyBrokenAuctionManagerSetups = null;

  const upcomingAuctions = null;
  const connection = useConnection();
  const wallet = useWallet();
  const { accountByMint } = useUserAccounts();

  const notifications: NotificationCard[] = [];

  const walletPubkey = wallet.publicKey?.toBase58() || '';


 

  const vaultsNeedUnwinding = useMemo(
    () =>
      Object.values(vaults).filter(
        v =>
          v.info.authority === walletPubkey &&
          v.info.state !== VaultState.Deactivated &&
          v.info.tokenTypeCount > 0,
      ),
    [vaults, walletPubkey],
  );

  vaultsNeedUnwinding.forEach(v => {
    notifications.push({
      id: v.pubkey,
      title: 'You have items locked in a defective auction!',
      description: (
        <span>
          During an auction creation process that probably had some issues, you
          lost an item. Reclaim it now.
        </span>
      ),
      action: async () => {
        try {
          // await unwindVault(
          //   connection,
          //   wallet,
          //   v,
          //   safetyDepositBoxesByVaultAndIndex,
          // );
        } catch (e) {
          console.error(e);
          return false;
        }
        return true;
      },
    });
  });

  notifications.push({
    id: 'none',
    title: 'Search for other auctions.',
    description: (
      <span>
        Load all auctions (including defectives) by pressing here. Then you can
        close them.
      </span>
    ),
    action: async () => {
      try {
        await pullAllSiteData();
      } catch (e) {
        console.error(e);
        return false;
      }
      return true;
    },
  });

  possiblyBrokenAuctionManagerSetups
    .filter(v => v.auctionManager.authority === walletPubkey)
    .forEach(v => {
      notifications.push({
        id: v.auctionManager.pubkey,
        title: 'You have items locked in a defective auction!',
        description: (
          <span>
            During an auction creation process that probably had some issues,
            you lost an item. Reclaim it now.
          </span>
        ),
        action: async () => {
          try {
            // await decommAuctionManagerAndReturnPrizes(
            //   connection,
            //   wallet,
            //   v,
            //   safetyDepositBoxesByVaultAndIndex,
            // );
          } catch (e) {
            console.error(e);
            return false;
          }
          return true;
        },
      });
    });

  const metaNeedsApproving = useMemo(
    () =>
      metadata.filter(m => {
        return (
          m.info.data.creators &&
          (whitelistedCreatorsByCreator[m.info.updateAuthority]?.info
            ?.activated ||
            store?.info.public) &&
          m.info.data.creators.find(
            c => c.address === walletPubkey && !c.verified,
          )
        );
      }),
    [metadata, whitelistedCreatorsByCreator, walletPubkey],
  );

  metaNeedsApproving.forEach(m => {
    notifications.push({
      id: m.pubkey,
      title: 'You have a new artwork to approve!',
      description: (
        <span>
          {whitelistedCreatorsByCreator[m.info.updateAuthority]?.info?.name ||
            m.pubkey}{' '}
          wants you to approve that you helped create their art{' '}
          <Link to={`/art/${m.pubkey}`}>here.</Link>
        </span>
      ),
      action: async () => {
        // try {
        //   await sendSignMetadata(connection, wallet, m.pubkey);
        // } catch (e) {
        //   console.error(e);
        //   return false;
        // }
        return true;
      },
    });
  });

  upcomingAuctions
    .filter(v => v.auctionManager.authority === walletPubkey)
    .forEach(v => {
      notifications.push({
        id: v.auctionManager.pubkey,
        title: 'You have an auction which is not started yet!',
        description: <span>You can activate it now if you wish.</span>,
        action: async () => {
          try {
         //   await startAuctionManually(connection, wallet, v);
          } catch (e) {
            console.error(e);
            return false;
          }
          return true;
        },
      });
    });

  const content = notifications.length ? (
    <div
      style={{ width: '300px', color: 'white' }}
      className={'notifications-container'}
    >
      <List
        itemLayout="vertical"
        size="small"
        dataSource={notifications.slice(0, 10)}
        renderItem={(item: NotificationCard) => (
          <List.Item
            extra={
              <>
                <RunAction
                  id={item.id}
                  action={item.action}
                  icon={<PlayCircleOutlined />}
                />
                {item.dismiss && (
                  <RunAction
                    id={item.id}
                    action={item.dismiss}
                    icon={<PlayCircleOutlined />}
                  />
                )}
              </>
            }
          >
            <List.Item.Meta
              title={<span>{item.title}</span>}
              description={
                <span>
                  <i>{item.description}</i>
                </span>
              }
            />
          </List.Item>
        )}
      />
    </div>
  ) : (
    <span>No notifications</span>
  );

  const justContent = (
    <Popover placement="bottomLeft" content={content} trigger="click">
      <img src={'/bell.svg'} style={{ cursor: 'pointer' }} />
      {!!notifications.length && <div className="mobile-notification">{notifications.length - 1}</div>}
    </Popover>
  );

  if (notifications.length === 0) return justContent;
  else
    return (
      <Badge
        count={notifications.length - 1}
        style={{ backgroundColor: 'white', color: 'black' }}
      >
        {justContent}
      </Badge>
    );
}

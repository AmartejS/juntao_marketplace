import { useMeta } from '../../../contexts/meta/meta';
import { useWallet } from '@solana/wallet-adapter-react';

import { useCreatorArts } from '../../../hooks/useCreatorArts';
import { ArtworkViewState, Item } from '../types';

import { useUserMetadataWithPacks } from './useUserMetadataWithPacks';
import { usePacksBasedOnProvingProcesses } from './usePacksBasedOnProvingProcesses';

export const useItems = ({
  activeKey,
}: {
  activeKey: ArtworkViewState;
}): Item[] => {
  const { publicKey } = useWallet();
  const { metadata } = useMeta();
  const createdMetadata = useCreatorArts(publicKey?.toBase58() || '');
  const userMetadataWithPacks = useUserMetadataWithPacks();
  const packsBasedOnProvingProcesses = usePacksBasedOnProvingProcesses();

  if (activeKey === ArtworkViewState.Owned) {
    return [...userMetadataWithPacks, ...packsBasedOnProvingProcesses];
  }

  if (activeKey === ArtworkViewState.Created) {
    return createdMetadata;
  }

  return metadata;
};

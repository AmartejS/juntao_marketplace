import {  ParsedAccount } from '../../contexts/types';
import{Metadata} from '../../actions/metadata';
//import { SafetyDepositDraft } from '../../actions/createAuctionManager';
import { ExtendedPack } from '../../types/packs';

export type Item = ExtendedPack  | ParsedAccount<Metadata>;

export enum ArtworkViewState {
  Metaplex = '0',
  Owned = '1',
  Created = '2',
}

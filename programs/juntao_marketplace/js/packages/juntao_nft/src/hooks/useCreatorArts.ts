import { useMeta } from '../contexts/meta/meta';
import { StringPublicKey } from '../utils/ids';

export const useCreatorArts = (id?: StringPublicKey) => {
  const { metadata } = useMeta();
  const filtered = metadata.filter(m =>
    m.info.data.creators?.some(c => c.address === id),
  );

  return filtered;
};

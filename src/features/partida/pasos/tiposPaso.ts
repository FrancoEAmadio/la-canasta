import type { Partida } from '../../../tipos';
import type { PartidaState } from '../usePartidaState';

export interface PropsPaso {
  partida: Partida;
  vista: NonNullable<PartidaState['vista']>;
}

import { persistentReducedStream, reducer } from 'rxbeach';
import getPostMessage$ from './postMessage$';
import { StreamEmission } from './types';
import { isBatch } from '../../../../../shared/src/guards';
import { MessageTypes } from '../../../../../shared/src/interfaces';
import { sortByTimestamp } from './utils';

export const EMISSION_LIMIT = 750;

type EmissionState = {
  emissions: StreamEmission[];
};

const limitEmissions = (emissions: StreamEmission[]) => {
  const sortedEmissions = emissions.sort(sortByTimestamp);
  if (sortedEmissions.length > EMISSION_LIMIT) {
    return sortedEmissions.slice(0, EMISSION_LIMIT);
  }
  return sortedEmissions;
};

const handlePostMessageUpdate = reducer(
  getPostMessage$(),
  (state: EmissionState, message) => {
    if (isBatch(message)) {
      return {
        emissions: limitEmissions([
          ...state.emissions,
          ...message.data
            .filter((msg) => msg.messageType === MessageTypes.NOTIFICATION)
            .map(({ data }) => {
              let value = {
                error: 'Parsing observable value failed',
              };
              try {
                value = JSON.parse(data.observable.value);
              } catch {}
              return {
                id: data.id,
                tag: data.observable.tag,
                value,
                timestamp: data.timestamp,
              } as StreamEmission;
            }),
        ]),
      };
    }
    return state;
  }
);

const emission$ = persistentReducedStream(
  'emission$',
  {
    emissions: [],
  },
  [handlePostMessageUpdate]
);

export default emission$;

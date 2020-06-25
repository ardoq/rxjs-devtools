import { ActionStream, stateStreamRegistry } from 'rxbeach';

export default function startStateStreams(action$: ActionStream) {
  stateStreamRegistry.startReducing(action$, module.hot?.data?.streamStates);

  if (module.hot) {
    module.hot.dispose((data) => {
      data.streamStates = stateStreamRegistry.getStates();
      stateStreamRegistry.stopReducing();
    });
  }
}

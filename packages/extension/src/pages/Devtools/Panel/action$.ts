import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { tag } from 'rxjs-spy/operators';
import { ActionStream } from 'rxbeach';
import { UnknownAction, markName } from 'rxbeach/internal';

const createActionStream = () => new Subject<UnknownAction>();
const actionSubject$ = createActionStream();

export const action$: ActionStream = actionSubject$.pipe(
  tag('action$'),
  markName('action$'),
  share()
);
export const dispatchAction = (action: UnknownAction) => {
  actionSubject$.next(action);
};

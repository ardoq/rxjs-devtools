import React, { useState } from 'react';
import { useStream, NOT_YET_EMITTED } from '../useStream';
import getMessage$ from './message$';
import { map, filter, shareReplay } from 'rxjs/operators';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import ReactJson from 'react-json-view';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardActions,
  Button,
  CardContent,
} from '@material-ui/core';

type Action = any;

const action$ = getMessage$().pipe(
  filter(message => message.messageType === 'batch'),
  map(message => {
    return message.messages
      .filter(msg => msg.broadcastType === 'notification')
      .filter(
        ({ notification }) =>
          notification.observable.tag === 'action$' &&
          notification.value &&
          notification.value.json
      )
      .map(({ notification }) => {
        const action = JSON.parse(notification.value.json);

        return {
          id: notification.id,
          type: action.type,
          payload: action.payload,
        };
      });
  }),
  shareReplay(1)
);

const Actions = () => {
  const actions = useStream(action$);
  const [selectedAction, setSelectedAction] = useState<Action>(null);
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography color="textSecondary" gutterBottom variant="h4">
          Actions
        </Typography>
        {actions !== NOT_YET_EMITTED && (
          <List component="nav" aria-label="main mailbox folders">
            {actions.map(action => (
              <ListItem
                key={action.id}
                button
                onClick={() => setSelectedAction(action)}
              >
                <ListItemText>{action.type}</ListItemText>
              </ListItem>
            ))}
          </List>
        )}
      </Grid>
      <Grid item xs={6}>
        {selectedAction && (
          <>
            <Typography color="textSecondary" gutterBottom>
              Action: {selectedAction.type}
            </Typography>
            <Typography variant="body2" component="p">
              {selectedAction.payload ? (
                <ReactJson theme="monokai" src={selectedAction.payload} />
              ) : (
                'No payload'
              )}
            </Typography>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default Actions;

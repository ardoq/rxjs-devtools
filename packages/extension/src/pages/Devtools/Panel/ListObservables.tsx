import React, { useState, useEffect } from 'react';
import { useStream, NOT_YET_EMITTED } from '../useStream';
import getPostMessage$ from './message$';
import { map, filter, shareReplay, bufferCount, scan } from 'rxjs/operators';
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
  TextField,
} from '@material-ui/core';
import { MessageTypes } from '../../../../../shared/src/interfaces';
import { Observable } from 'rxjs';



function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return (date.getHours() + ':' + String(date.getMinutes()).padStart(2, "0") + ':' + String(date.getSeconds()).padStart(2, "0"));
}

const groupBy = <T,>(data: T[], keyFn: ((v: T) => string)) => data.reduce((agg, item) => {
  const key = keyFn(item);
  agg[key] = [...(agg[key] || []), item];
  return agg;
}, {} as Record<string, T[]>);

type StreamEmission = {
  id: string;
  tag: string;
  value: any;
  timestamp: number;
};

type ViewModel = {
  [key: string]: StreamEmission[];
};

const streamEmission$: Observable<ViewModel> = getPostMessage$().pipe(
  filter(({ messageType }) => messageType === MessageTypes.BATCH),
  map(message => {
    return message.data
      .filter(msg => msg.messageType === MessageTypes.NOTIFICATION).map(({ data }) => {
        return {
          id: data.id,
          tag: data.observable.tag,
          value: {
            ...data.observable,
            timestamp: data.timestamp,
            value: JSON.parse(data.observable.value)
          },
          timestamp: data.timestamp,
        } as StreamEmission;
      });
  }),
  scan((values: StreamEmission[], next) => [...values, ...next], []),
  map(values => values.sort((a, b) => b.timestamp - a.timestamp)),
  map(values => groupBy(values, (value) => value.tag)),
  shareReplay(1)
);

type StreamModel = {
  tag: string;
  emissions: StreamEmission[]
};

const InspectStream = ({ stream }: { stream: StreamModel }) => {
  const [selectedEmission, setSelectedEmission] = useState<StreamEmission>(stream.emissions[0]);
  useEffect(() => {
    if (stream.tag !== selectedEmission.tag) {
      setSelectedEmission(stream.emissions[0]);
    }
  }, [stream]);
  return (
    <>

      <Typography color="textSecondary" gutterBottom>
        Selected Tag: {stream.tag} ({stream.emissions.length} emissions recorded)
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <h3>Emissions:</h3>
          {stream.emissions.map(emission => {
            const isSelected = selectedEmission === emission;
            const stringified = emission.value.value.type ? emission.value.value.type : '';
            const value = `${stringified} emitted at ${formatTimestamp(emission.timestamp)}`;
            return (
              <Typography variant="body1" component="p" onClick={() => setSelectedEmission(emission)}>
                {isSelected ? <strong>{value}</strong> : value}
              </Typography>
            );
          }
          )}
        </Grid>
        <Grid item xs={6}>
          <h3>Selected Emission:</h3>
          <ReactJson theme="monokai" src={selectedEmission.value} />
        </Grid>
      </Grid>
    </>
  );
}

const ListObservables = () => {
  const viewModel = useStream(streamEmission$);
  const [selectedTag, setSelectedTag] = useState<StreamModel | null>(null);
  const [tagFilter, setTagFilter] = useState<string>('');
  useEffect(() => {
    if (viewModel !== NOT_YET_EMITTED && selectedTag) {
      setSelectedTag({
        tag: selectedTag.tag,
        emissions: viewModel[selectedTag.tag]
      });
    }
  }, [viewModel]);
  if (viewModel === NOT_YET_EMITTED) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography color="textSecondary" gutterBottom variant="h4">
            ...waiting for first emission
        </Typography>
        </Grid>
      </Grid>
    );
  }
  const emissions = Object.entries(viewModel);
  const filteredEmissions = emissions.filter(([tag]) => tag.includes(tagFilter)).sort();
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Typography color="textSecondary" gutterBottom variant="h4">
          Stream emissions by tag ({emissions.length} tags in total)
        </Typography>
        <TextField placeholder="Filter by tag" onChange={(event) => setTagFilter(event.target.value)} />
        <List component="nav" aria-label="main mailbox folders">
          {filteredEmissions.map(([tag, emissions]) => (
            <ListItem
              key={tag}
              button
              selected={selectedTag?.tag === tag}
              onClick={() => setSelectedTag({ tag, emissions })}
            >
              <ListItemText>{tag} (last emitted at {formatTimestamp(emissions[0].timestamp)})</ListItemText>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={8}>
        {selectedTag && <InspectStream stream={selectedTag} />}
      </Grid>
    </Grid>
  );
};

export default ListObservables;

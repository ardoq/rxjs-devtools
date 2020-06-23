import React, { useState } from 'react';
import { useStream, NOT_YET_EMITTED } from '../useStream';
import getPostMessage$ from './message$';
import { map, filter, shareReplay, scan } from 'rxjs/operators';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {
  Grid,
  Typography,
  TextField,
} from '@material-ui/core';
import { MessageTypes } from '../../../../../shared/src/interfaces';
import { isBatch } from '../../../../../shared/src/guards';
import { Observable } from 'rxjs';
import styled from 'styled-components';
import { StreamEmission } from './types';
import { sortByTimestamp, groupBy, formatTimestamp } from './utils';
import InspectEmissions from './InspectEmissions';
import DenseTable from './DenseTable';
import emission$, { EMISSION_LIMIT } from './emission$';
import { connect } from 'rxbeach/react';

type ListObservablesViewModel = {
  emissionsByTag: {
    [key: string]: StreamEmission[]
  };
};
const ListObservables = ({ emissionsByTag }: ListObservablesViewModel) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string>('');
  if (Object.keys(emissionsByTag).length === 0) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography gutterBottom variant="h5">
            ...waiting for first emission
        </Typography>
        </Grid>
      </Grid>
    );
  }
  const emissions = Object.entries(emissionsByTag);
  const filteredEmissions = emissions.filter(([tag]) => tag.includes(tagFilter)).sort();
  const allEmissionsSorted = Object.values(emissionsByTag).flatMap(a => a).sort(sortByTimestamp);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography color="textSecondary" gutterBottom>
          Currently capped at ~{EMISSION_LIMIT} emissions due to performance limitations (the least recent emissions are dropped).
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography gutterBottom variant="h5">
          Tagged streams ({emissions.length} tags recorded)
        </Typography>
        {/* <TextField placeholder="Filter by tag" onChange={(event) => setTagFilter(event.target.value)} /> */}
        <DenseTable
          onRowClick={(row => setSelectedTag(row.tag))}
          isRowSelected={(row => row.tag === selectedTag)}
          columns={[{
            title: 'Tag',
            valueRender: (row => row.title)
          }, {
            title: 'Last emitted',
            valueRender: (row => formatTimestamp(row.emissions[0].timestamp))
          }
          ]}
          data={[{ tag: null, title: 'All', emissions: allEmissionsSorted }, ...filteredEmissions.map(([tag, emissions]) => ({
            tag,
            emissions,
            title: tag
          }))]} />
      </Grid>
      <Grid item xs={9}>
        <InspectEmissions selectedTag={selectedTag} emissions={selectedTag ? emissionsByTag[selectedTag] : allEmissionsSorted} />
      </Grid>
    </Grid>
  );
};

const viewModel$ = emission$.pipe(
  map(({ emissions }) => ({
    emissionsByTag: groupBy(emissions, (value) => value.tag)
  })),
)

export default connect(
  ListObservables,
  viewModel$
);
import React, { useState } from 'react';
import { map } from 'rxjs/operators';
import { Grid, Typography } from '@material-ui/core';
import { StreamEmission } from './types';
import { sortByTimestamp, groupBy, formatTimestamp } from './utils';
import InspectEmissions from './InspectEmissions';
import DenseTable from './DenseTable';
import emission$, { EMISSION_LIMIT } from './emission$';
import { connect } from 'rxbeach/react';

type ListObservablesViewModel = {
  emissionsByTag: {
    [key: string]: StreamEmission[];
  };
};
const ListObservables = ({ emissionsByTag }: ListObservablesViewModel) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
  const allEmissionsSorted = Object.values(emissionsByTag)
    .flatMap((a) => a)
    .sort(sortByTimestamp);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography color="textSecondary" gutterBottom>
          Currently capped at ~{EMISSION_LIMIT} emissions due to performance
          limitations (the least recent emissions are dropped).
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography gutterBottom variant="h5">
          Tagged streams ({emissions.length} tags recorded)
        </Typography>
        <DenseTable
          onRowClick={(row) => setSelectedTag(row.tag)}
          isRowSelected={(row) => row.tag === selectedTag}
          columns={[
            {
              title: 'Tag',
              valueRender: (row) => row.title,
            },
            {
              title: 'Last emitted',
              valueRender: (row) => formatTimestamp(row.emissions[0].timestamp),
            },
          ]}
          data={[
            { tag: null, title: 'All', emissions: allEmissionsSorted },
            ...emissions.map(([tag, tagEmissions]) => ({
              tag,
              emissions: tagEmissions,
              title: tag,
            })),
          ]}
        />
      </Grid>
      <Grid item xs={9}>
        <InspectEmissions
          selectedTag={selectedTag}
          emissions={
            selectedTag ? emissionsByTag[selectedTag] : allEmissionsSorted
          }
        />
      </Grid>
    </Grid>
  );
};

const viewModel$ = emission$.pipe(
  map(({ emissions }) => ({
    emissionsByTag: groupBy(emissions, (value) => value.tag),
  }))
);

export default connect(ListObservables, viewModel$);

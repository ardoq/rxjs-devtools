import React, { useState } from 'react';
import { map } from 'rxjs/operators';
import { Grid, Typography, Button } from '@material-ui/core';
import { StreamEmission } from './types';
import { sortByTimestamp, groupBy, formatTimestamp } from './utils';
import InspectEmissions from './InspectEmissions';
import DenseTable from './DenseTable';
import emission$, { EMISSION_LIMIT } from './emission$';
import { connect } from 'rxbeach/react';
import { dispatchAction } from './action$';
import { clearEmissions } from './actions';

type ListObservablesViewModel = {
  emissionsByTag: {
    [key: string]: StreamEmission[];
  };
};
const ListObservables = ({ emissionsByTag }: ListObservablesViewModel) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
          <Button
            color="secondary"
            onClick={() => dispatchAction(clearEmissions())}
          >
            Clear All Emissions
          </Button>
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
              label: 'Tag',
              valueRender: (row) => row.title,
              width: 225,
              dataKey: 'title',
            },
            {
              label: 'Last emitted',
              valueRender: (row) =>
                row.emissions[0]
                  ? formatTimestamp(row.emissions[0].timestamp)
                  : 'Never',
              width: 125,
              dataKey: 'emissions',
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

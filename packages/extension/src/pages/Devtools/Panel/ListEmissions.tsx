import React from 'react';
import { map } from 'rxjs/operators';
import { Grid } from '@material-ui/core';
import { StreamEmission } from './types';
import { sortByTimestamp } from './utils';
import InspectEmissions from './InspectEmissions';
import emission$ from './emission$';
import { connect } from 'rxbeach/react';

type ListEmissionsViewModel = {
  sortedEmissions: StreamEmission[];
};

const ListEmissions = ({ sortedEmissions }: ListEmissionsViewModel) => {
  return (
    <Grid
      style={{ padding: '20px', height: '80vh' }}
      alignContent="flex-start"
      container
      spacing={2}
    >
      <Grid item xs={12} style={{ height: '100%' }}>
        <InspectEmissions emissions={sortedEmissions} />
      </Grid>
    </Grid>
  );
};

const viewModel$ = emission$.pipe(
  map(({ emissions }) => ({
    sortedEmissions: emissions.sort(sortByTimestamp),
  }))
);

export default connect(ListEmissions, viewModel$);

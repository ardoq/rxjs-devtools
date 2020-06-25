import React, { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import { Typography, Grid, TextField } from '@material-ui/core';
import { formatTimestamp } from './utils';
import { StreamEmission } from './types';
import DenseTable from './DenseTable';

type InspectEmissionsViewModel = {
  selectedTag: string | null;
  emissions: StreamEmission[];
};

const InspectEmissions = ({
  selectedTag,
  emissions,
}: InspectEmissionsViewModel) => {
  const [selectedEmission, setSelectedEmission] = useState<StreamEmission>(
    emissions[0]
  );
  const [rawFilters, setFilter] = useState('');
  useEffect(() => {
    if (selectedTag !== selectedEmission.tag) {
      setSelectedEmission(emissions[0]);
    }
  }, [selectedTag]);

  const filters = rawFilters
    .split(',')
    .map((rawFilter) => rawFilter.trim())
    .filter(Boolean);
  return (
    <>
      <Typography variant="h5" gutterBottom>
        {selectedTag ? `Selected Tag: ${selectedTag}` : 'All tags'} (
        {emissions.length} emissions recorded)
      </Typography>

      <TextField
        fullWidth
        label="Filter by tag or action type (comma-separated list):"
        onChange={(e) => setFilter(e.target.value)}
      />
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <DenseTable
            onRowClick={(emission) => setSelectedEmission(emission)}
            isRowSelected={(emission) => selectedEmission === emission}
            columns={[
              {
                label: 'Type',
                valueRender: (emission) =>
                  emission.tag === 'action$' ? `Action` : `Tagged stream`,
                width: 200,
                dataKey: 'tag',
              },
              {
                label: 'Value',
                valueRender: (emission) =>
                  emission.tag === 'action$'
                    ? emission.value.type
                    : emission.tag,
                width: 300,
                dataKey: 'tag',
              },
              {
                label: 'Timestamp',
                valueRender: (emission) => formatTimestamp(emission.timestamp),
                width: 125,
                dataKey: 'timestamp',
              },
            ]}
            data={emissions.filter(
              (emission) =>
                !filters.length ||
                filters.some(
                  (filter) =>
                    emission.tag.includes(filter) ||
                    emission.value?.type?.includes(filter)
                )
            )}
          />
        </Grid>
        <Grid item xs={7}>
          <ReactJson
            style={{
              fontSize: 14,
              minHeight: 300,
              height: '70vh',
              overflowY: 'scroll',
            }}
            theme="monokai"
            src={selectedEmission}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default InspectEmissions;

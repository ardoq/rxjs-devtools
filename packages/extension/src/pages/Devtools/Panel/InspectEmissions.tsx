import React, { useState, useCallback } from 'react';
import ReactJson from 'react-json-view';
import {
  Typography,
  Grid,
  TextField,
  Button,
  Tooltip,
  colors,
} from '@material-ui/core';
import { formatTimestamp } from './utils';
import { StreamEmission } from './types';
import DenseTable from './DenseTable';
import { debounce } from 'lodash';
import { EMISSION_LIMIT } from './emission$';
import { dispatchAction } from './action$';
import { clearEmissions } from './actions';
import WarningIcon from '@material-ui/icons/Warning';
import StorageIcon from '@material-ui/icons/Storage';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import styled from 'styled-components';

type InspectEmissionsViewModel = {
  emissions: StreamEmission[];
};

const StateIcon = styled(StorageIcon)`
  margin-right: 8px;
  vertical-align: bottom;
`;

const ActionIcon = styled(NotificationsActiveIcon)`
  margin-right: 8px;
  vertical-align: bottom;
`;

const InspectEmissions = ({
  emissions,
}: InspectEmissionsViewModel): JSX.Element => {
  const [
    selectedEmission,
    setSelectedEmission,
  ] = useState<StreamEmission | null>(null);
  const [rawFilters, setFilter] = useState('');

  const debouncedSetFilter = useCallback(
    debounce((value: string) => setFilter(value), 200),
    [setFilter]
  );

  const filters = rawFilters
    .split(',')
    .map((rawFilter) => rawFilter.trim())
    .filter(Boolean);

  const filteredData = emissions.filter(
    (emission) =>
      !filters.length ||
      filters.some(
        (filter) =>
          emission.tag.includes(filter) ||
          emission.value?.type?.includes(filter)
      )
  );

  return (
    <>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid item xs={5}>
          <Typography variant="h5" gutterBottom>
            {emissions.length} emissions recorded
            {emissions.length === EMISSION_LIMIT && (
              <Tooltip
                title={`Currently capped at ~${EMISSION_LIMIT} emissions due to performance limitations (the least recent emissions are dropped).`}
              >
                <WarningIcon
                  htmlColor={colors.orange.A400}
                  style={{
                    marginLeft: '4px',
                    verticalAlign: 'middle',
                  }}
                />
              </Tooltip>
            )}
            <Button
              style={{ float: 'right' }}
              color="secondary"
              onClick={() => dispatchAction(clearEmissions())}
            >
              Clear All
            </Button>
          </Typography>

          <TextField
            fullWidth
            label="Filter by name (comma-separated list):"
            onChange={(e) => debouncedSetFilter(e.target.value)}
          />
          <DenseTable
            onRowClick={(emission) => setSelectedEmission(emission)}
            isRowSelected={(emission) => selectedEmission === emission}
            columns={[
              {
                label: 'Name',
                valueRender: (emission) =>
                  emission.tag === 'action$' ? (
                    <>
                      <ActionIcon fontSize="small" />
                      {emission.value?.type}
                    </>
                  ) : (
                    <>
                      <StateIcon fontSize="small" />
                      {emission.tag}
                    </>
                  ),
                width: 400,
                dataKey: 'tag',
              },
              {
                label: 'Timestamp',
                valueRender: (emission) => formatTimestamp(emission.timestamp),
                width: 125,
                dataKey: 'timestamp',
              },
            ]}
            data={filteredData}
          />
        </Grid>
        <Grid item xs={7} style={{ height: '100%' }}>
          {selectedEmission && (
            <ReactJson
              collapsed={3}
              style={{
                fontSize: 14,
                minHeight: 300,
                height: '100%',
                overflowY: 'scroll',
              }}
              theme="monokai"
              src={selectedEmission}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default InspectEmissions;

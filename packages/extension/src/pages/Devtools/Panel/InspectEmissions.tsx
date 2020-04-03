import React, { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import { ListItemText, Typography, Grid, ListItem, List } from '@material-ui/core';
import { formatTimestamp } from './utils';
import { StreamEmission } from './types';
import styled from 'styled-components';
import DenseTable from './DenseTable';


type InspectEmissionsViewModel = {
  selectedTag: string | null;
  emissions: StreamEmission[];
}

const InspectEmissions = ({ selectedTag, emissions }: InspectEmissionsViewModel) => {
  const [selectedEmission, setSelectedEmission] = useState<StreamEmission>(emissions[0]);
  useEffect(() => {
    if (selectedTag !== selectedEmission.tag) {
      setSelectedEmission(emissions[0]);
    }
  }, [selectedTag]);
  return (
    <>

      <Typography variant="h5" gutterBottom>
        {selectedTag ?
          `Selected Tag: ${selectedTag}`
          : 'All tags'}  ({emissions.length} emissions recorded)
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={5}>
          <DenseTable
            onRowClick={(emission => setSelectedEmission(emission))}
            isRowSelected={(emission => selectedEmission === emission)}
            columns={[{
              title: 'Type',
              valueRender: (emission => emission.tag === 'action$' ? `Action` : `Tagged stream`)
            }, {
              title: 'Value',
              valueRender: (emission => emission.tag === 'action$' ? emission.value.type : emission.tag)
            }, {
              title: 'Timestamp',
              valueRender: (emission => formatTimestamp(emission.timestamp))
            }
            ]}
            data={emissions} />
        </Grid>
        <Grid item xs={7}>
          <ReactJson
            style={{ fontSize: 14, minHeight: 300, height: '70vh', overflowY: 'scroll' }} theme="monokai"
            src={selectedEmission} />
        </Grid>
      </Grid>
    </>
  );
}

export default InspectEmissions;
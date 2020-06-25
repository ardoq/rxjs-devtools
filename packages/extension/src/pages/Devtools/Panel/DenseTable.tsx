import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  Paper,
} from '@material-ui/core';
import styled from 'styled-components';

interface ViewProps<T> {
  onRowClick: (value: T) => void;
  isRowSelected: (value: T) => boolean;
  columns: {
    title: string;
    valueRender: (value: T) => any;
  }[];
  data: T[];
}

const StyledTableContainer = styled(TableContainer).attrs((props) => ({
  component: Paper,
}))`
  max-height: 70vh;
  overflow-y: scroll;
`;

function DenseTable<T>({
  columns,
  data,
  onRowClick,
  isRowSelected,
}: ViewProps<T>) {
  return (
    <StyledTableContainer>
      <Table stickyHeader size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {columns.map(({ title }) => (
              <TableCell key={title}>{title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((value, i) => (
            <TableRow
              hover
              onClick={() => onRowClick(value)}
              selected={isRowSelected(value)}
              key={i}
            >
              {columns.map(({ valueRender }) => (
                <TableCell>{valueRender(value)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
}

export default DenseTable;

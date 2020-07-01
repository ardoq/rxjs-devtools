import React from 'react';
import { TableCell, colors } from '@material-ui/core';
import styled from 'styled-components';
import { AutoSizer, Column, Table } from 'react-virtualized';

interface ViewProps<T> {
  onRowClick: (value: T) => void;
  isRowSelected: (value: T) => boolean;
  columns: {
    label: string;
    valueRender: (value: T) => any;
    width: number;
    dataKey: string;
  }[];
  data: T[];
}

const StyledTable = (styled(Table)`
  .dense-table-column {
    align-items: center;
    box-sizing: border-box;
    display: flex;
  }

  .dense-table-row-header,
  .dense-table-row {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
  }

  .dense-table-row {
    cursor: pointer;

    &:focus {
      outline: none;
    }

    &:hover,
    &.selected {
      background-color: ${colors.grey[900]};
    }
  }
` as unknown) as typeof Table;

const StyledTableCell = styled(TableCell)`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  text-overflow: ellipsis;

  &:focus {
    outline: none;
  }
`;

function DenseTable<T>({
  columns,
  data,
  onRowClick,
  isRowSelected,
}: ViewProps<T>): JSX.Element {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <StyledTable
          height={height}
          width={width}
          rowCount={data.length}
          rowHeight={40}
          headerHeight={40}
          headerClassName={'dense-table-header'}
          rowClassName={({ index }) =>
            [
              index === -1 && 'dense-table-row-header',
              index !== -1 && 'dense-table-row',
              data[index] && isRowSelected(data[index]) && 'selected',
            ]
              .filter(Boolean)
              .join(' ')
          }
          rowGetter={({ index }) => data[index]}
          gridStyle={{
            direction: 'inherit',
          }}
          onRowClick={({ rowData }) => onRowClick(rowData)}
        >
          {columns.map(({ dataKey, valueRender, ...other }) => (
            <Column
              key={dataKey}
              dataKey={dataKey}
              headerRenderer={({ label }) => (
                <StyledTableCell>{label}</StyledTableCell>
              )}
              className={'dense-table-column'}
              cellRenderer={({ rowData }) => (
                <StyledTableCell>{valueRender(rowData)}</StyledTableCell>
              )}
              {...other}
            />
          ))}
        </StyledTable>
      )}
    </AutoSizer>
  );
}

export default DenseTable;

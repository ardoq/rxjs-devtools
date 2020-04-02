import React, { Component } from 'react';
import ListObservables from './ListObservables';
import styled from 'styled-components';
import { ThemeProvider, createMuiTheme, Paper } from '@material-ui/core';

const Wrapper = styled(Paper)`
  margin: 0px;
  padding: 40px 20px;
`;

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={darkTheme}>
        <Wrapper>
          <ListObservables />
        </Wrapper>
      </ThemeProvider>
    );
  }
}

export default App;

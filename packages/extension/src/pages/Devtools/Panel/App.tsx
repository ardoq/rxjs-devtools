import React, { Component } from 'react';
import ListEmissions from './ListEmissions';
import styled from 'styled-components';
import { ThemeProvider, createMuiTheme, Paper } from '@material-ui/core';
import WebFont from 'webfontloader';

WebFont.load({ google: { families: ['Roboto:300,400,500'] } });
const Wrapper = styled(Paper)`
  height: 100%;
  width: 100%;
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
          <ListEmissions />
        </Wrapper>
      </ThemeProvider>
    );
  }
}

export default App;

import React, { Component } from 'react';
import ListObservables from './ListObservables';
import styled from 'styled-components';
import { ThemeProvider, createMuiTheme, Paper } from '@material-ui/core';
import WebFont from 'webfontloader';

WebFont.load({ google: { families: ['Roboto:300,400,500'] } });
const Wrapper = styled(Paper)`
  margin: 0px;
  padding: 40px 20px;
  position: absolute;
  top: 0px;
  right: 0px;
  left: 0px;
  bottom: 0px;
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

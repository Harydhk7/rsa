import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';

import CircularProgress from '@mui/material/CircularProgress';
class CustomLoaderReports extends Component {
  constructor(props) {
    super(props)
    this.state = { seconds: 0, toshow: 0 }
  }
  convert(n) {
    var sep = ':',
      n = parseFloat(n),
      sss = parseInt((n % 1) * 1000),
      hh = parseInt(n / 3600);
    n %= 3600;
    var mm = parseInt(n / 60),
      ss = parseInt(n % 60);
    return pad(hh, 2) + sep + pad(mm, 2) + sep + pad(ss, 2) + '.' + pad(sss, 3);
    function pad(num, size) {
      var str = num + "";
      while (str.length < size) str = "0" + str;
      return str;
    }
  }
  componentDidMount = () => {

    window.setInterval(() => {
      this.setState({ toshow: this.convert(this.state.seconds) })
      this.setState({ seconds: this.state.seconds+1})
    }, 1000)
  }
  componentWillUnmount = () => {

  }
  render() {
    return (
      <Modal className='centerThisLoader'
        show={this.props.show}
        backdrop="static"
        keyboard={false}
        disableEnforceFocus={true}
      >
        <center className='centerLoaderSymbol'>
          <CircularProgress color="info" />
          Loading .... {this.state.toshow} 
        </center>
      </Modal>
    );
  }
}

export default CustomLoaderReports;
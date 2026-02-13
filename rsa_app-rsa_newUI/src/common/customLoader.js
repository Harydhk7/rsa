import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';

import CircularProgress from '@mui/material/CircularProgress';
class CustomLoader extends Component {
    constructor(props){
        super(props)
    }
    render() {
        return (
      <Modal className='centerThisLoader'
        show={this.props.show}
        backdrop="static"
        keyboard={false}
        disableEnforceFocus = {true}
      >  
      <center className='centerLoaderSymbol'>      
      <CircularProgress color="info" />    
       Please wait...     
      </center>
      </Modal> 
        );
    }
}

export default CustomLoader;
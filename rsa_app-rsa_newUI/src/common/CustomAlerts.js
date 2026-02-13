// import { useState } from 'react';
// import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal';

// function CustomAlerts(props) {

//   const [dummy, setDummy] = useState('');
//   const handleClose = () => {
//     localStorage.setItem("alertOpen",false);
//     setDummy(Math.random())
//   };

//   return (
//     <>
//       <Modal className='centerThis'
//         show={JSON.parse(localStorage.getItem("alertOpen"))}
//         onHide={handleClose}
//         backdrop="static"
//         keyboard={false}
//         disableEnforceFocus = {true}
//       >
//         <Modal.Header  className = {"color"+props.severity+"Header"}>
//           <Modal.Title
//         className = {"color"+props.severity}>{props.severity}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {props.msg}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button style={{margin: '0 auto', display: "flex"}} variant="secondary" onClick={handleClose}>
//           OK
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// }

//export default CustomAlerts;
import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import { Button } from "@mui/material";

function CustomAlerts({ children, onClose }) {
  return (
    <div>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          {children}
          <button style={styles.closeButton} onClick={onClose}>
            <CancelIcon />
          </button>
          <div
            style={{
              marginTop: "21px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Button
              variant="contained"
              style={{ width: "100px", backgroundColor: "rgb(46, 75, 122)" }}
              // onClick={handleResestConform}
              onClick={onClose}
            >
              Okay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomAlerts;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100000000,
  },
  modal: {
    backgroundColor: "#d9f5fc",
    padding: "20px",
    borderRadius: "8px",
    position: "relative",
    width: "300px",
    height: "auto",
    // maxWidth: "500px"
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "20px",
    zIndex: "20000",
    cursor: "pointer",
  },
};

import React from "react";
import AuditorHeader from "../AuditorHeader/AuditorHeader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Modal, TextField } from "@mui/material";
import Draggable from "react-draggable";
import mapimg from "../../../Assets/mapgroup.png";
import { useNavigate } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  height: "50%",
  bgcolor: "white",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};
function SurveyformOne() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <div>
      <AuditorHeader />
      <div
        style={{
          backgroundColor: "#f4f7fa",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            //   justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <ArrowBackIcon />
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "30%",
                backgroundColor: "white",
                height: "20px",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  width: "50%",
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  height: "20px",
                  borderRadius: "10px",
                }}
              >
                {/* egtfrhgs */}
              </div>
            </div>
            <div
              style={{
                width: "30%",
                backgroundColor: "white",
                height: "20px",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  width: "0%",
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  height: "20px",
                  borderRadius: "10px",
                }}
              >
                {/* egtfrhgs */}
              </div>
            </div>{" "}
            <div
              style={{
                width: "30%",
                backgroundColor: "white",
                height: "20px",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  width: "0%",
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  height: "20px",
                  borderRadius: "10px",
                }}
              >
                {/* egtfrhgs */}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            border: "0.5px solid rgba(127, 163, 222, 0.3)",
            // height: "300px",
            marginTop: "20px",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "28px",
              backgroundColor: "#f4f7fa",
              color: "rgba(46, 75, 122, 1)",
              marginBottom: '15%'

            }}
          >
            Audit Details
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <TextField
              fullWidth
              id="outlined-basic"
              label="Audit Team member"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Department"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Designation"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Email"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Contact"
              variant="outlined"
            />
          </div>
        </div>

        {/* locatoin details */}

        <div
          style={{
            position: "relative",
            border: "0.5px solid rgba(127, 163, 222, 0.3)",
            // height: "300px",
            marginTop: "20px",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "28px",
              backgroundColor: "#f4f7fa",
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Location Details
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <TextField
              fullWidth
              id="outlined-basic"
              label="State"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="District"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Start Photo *"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Existing Km chainage"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Landmark * "
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Road Type *"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Landuse Pattern *"
              variant="outlined"
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Type of terrain"
              variant="outlined"
            />
            <Button
              style={{
                backgroundColor: "rgba(14, 176, 0, 1)",
                color: "white",
                width: "150px",
                margin: "auto",
              }}
              onClick={() => navigate("/Auditor_survey_two")}
            >
              Save
            </Button>
          </div>
        </div>
        <Draggable>
          <div
            style={{
              width: "50px",
              height: "50px",
              boxShadow:
                "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              padding: "9px",
              position: "absolute",
              bottom: "20px",
              right: "10px",
              zIndex: "1000",
              backgroundColor: "white",
            }}
            onClick={handleOpen}
          >
            <img src={mapimg} style={{ width: "28px", height: "29px" }} />
          </div>
        </Draggable>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          style={style}
          sx={{
            backgroundColor: "white",
            padding: "20PX",
          }}
        >
          Map
        </Box>
      </Modal>
    </div>
  );
}

export default SurveyformOne;

// import React from "react";

// function AddCommentReport() {
//   return <div>AddCommentReport</div>;
// }

// export default AddCommentReport;
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import React from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
function AddCommentReport() {
  const data = [
    {
      stretchId: 1,
      stretchName: "Stretch A",
      chainage: "10-20",
      leadAuditName: "John Doe",
      latLng: "12.34, 56.78",
      roadType: "Highway",
      assignDate: "2024-11-20",
      completedDate: "2024-11-21",
      workStatus: "Completed",
    },
    {
      stretchId: 2,
      stretchName: "Stretch B",
      chainage: "20-30",
      leadAuditName: "Jane Smith",
      latLng: "23.45, 67.89",
      roadType: "Urban",
      assignDate: "2024-11-19",
      completedDate: "2024-11-20",
      workStatus: "Pending",
    },
  ];
  return (
    <div style={{ padding: "20px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p
            style={{
              color: "rgba(46, 75, 122, 1)",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            Comment Form
          </p>
          <Button
            style={{ background: "rgba(46, 75, 122, 1)", color: "white" }}
            onClick={() => {
              document.title = "RSSA Report comment details";
              window.print();
            }}
          >
            <FileDownloadOutlinedIcon />
            Download
          </Button>
        </div>
        <div
          style={{
            border: "1px solid rgba(127, 163, 222, 0.3)",
            borderRadius: "10px",
            // height: "10vh",
            marginTop: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              color: "rgba(119, 114, 114, 1)",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <p>Stretch Id </p>
            <p>Stretch Name</p>
            <p>Road Name</p>
            <p>Road Number</p>
            <p>Comment Date</p>
          </div>
        </div>
        {/* <div
          style={{
            border: "1px solid rgba(127, 163, 222, 0.3)",
            borderRadius: "10px",
            // height: "10vh",
            marginTop: "20px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            <TextField
              fullWidth
              label="Page No"
              variant="outlined"
              style={{ width: "200px" }}
            />
            <FormControl fullWidth style={{ width: "200px" }}>
              <InputLabel>Section</InputLabel>
              <Select variant="outlined" defaultValue="">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
          </div>
          <TextField
            fullWidth
            multiline
            minRows={7}
            label="Page No"
            variant="outlined"
            style={{ marginTop: "15px" }}
          />
          <div style={{ display: "flex", justifyContent: "end" }}>
            <Button
              style={{
                backgroundColor: "rgba(46, 75, 122, 1)",
                color: "white",
                marginTop: "15px",
              }}
            >
              Add
            </Button>
          </div>
        </div> */}
        <TableContainer style={{ marginTop: "15px" }} component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgba(46, 75, 122, 1)" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  SI no
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Page No
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Section
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Version
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Comment
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Response
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f2f4f7" : "#ffffff",
                  }}
                >
                  <TableCell>{row.stretchId}</TableCell>
                  <TableCell>{row.stretchName}</TableCell>
                  <TableCell>{row.chainage}</TableCell>
                  <TableCell>{row.leadAuditName}</TableCell>
                  <TableCell>{row.latLng}</TableCell>
                  <TableCell>{row.latLng}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <Button
            style={{
              border: "1.05px solid rgba(127, 163, 222, 0.3)",
              //   backgroundColor: "rgba(46, 75, 122, 1)",
              color: "rgba(46, 75, 122, 1)",
              marginTop: "15px",
            }}
          >
            Edit
          </Button>
          <Button
            style={{
              backgroundColor: "rgba(46, 75, 122, 1)",
              color: "white",
              marginTop: "15px",
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddCommentReport;

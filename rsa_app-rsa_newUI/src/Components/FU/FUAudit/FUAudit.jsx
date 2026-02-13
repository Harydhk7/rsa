import React, { useEffect, useState } from "react";
import FUHeader from "../FUHeader/FUHeader";

import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  OutlinedInput,
  InputAdornment,
  Avatar,
  AvatarGroup,
  Modal,
} from "@mui/material";
// import imgprofile from "../../Assets/FRAME.png";
// import EditIcon from "@mui/icons-material/Edit";
// import "../Users.css";
import JSZip from 'jszip';
import SearchIcon from "@mui/icons-material/Search";
import GridViewSharpIcon from "@mui/icons-material/GridViewSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";
import FilterListSharpIcon from "@mui/icons-material/FilterListSharp";
import { useNavigate } from "react-router-dom";
import imgmap from "../../../Assets/map.png";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

import AxiosApp from "../../../common/AxiosApp";
import CustomAlerts from "../../../common/CustomAlerts";
import CustomLoader from "../../../common/customLoader";

import { url1 } from "../../../App";
import sampleImg from "../../../Assets/logo.png"

import L, { icon } from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
var imageSource = new Map()
var map = '';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  height: "70vh",
  bgcolor: "white",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};
const style1 = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40%",
  height: "70vh",
  bgcolor: "white",
  borderRadius: "10px",
  // border: "2px solid #000",
  // boxShadow: 24,
  overflowY: "auto",
  scrollBehavior: "smooth",
  p: 4,
};
//key:auditid
//value:[arrays of urls]

const borderColorMap = new Map();
borderColorMap.set("report submitted", "rgb(225, 120, 27)")
borderColorMap.set("report approved", "rgb(225, 180, 127)")
borderColorMap.set("report rejected", "rgb(225, 100, 127)")
//borderColorMap.set("report accepted", "")
borderColorMap.set("field audit completed", "rgb(225, 240, 127)")

function FUAudit() {
  localStorage.setItem("secCatnames", "")
  localStorage.setItem("sectionStuff", "")

  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [buttonClick, setButtonClick] = useState("view");
  const [showObj, setShowObj] = React.useState({})

  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [dummy, setDummy] = useState(0)

  const [filename, setFilename] = useState("");
  const [fileImage, setFileImage] = useState("");
  const [fileURL, setFileURL] = useState("");

  const [startList, setStartList] = useState([]);
  const [progressList, setProgressList] = useState([])
  const [completedList, setCompletedList] = useState([]);
  const auditorID = localStorage.getItem("rsaLogged")

  const loadLists = () => {
    let l1 = { "user_id": auditorID }

    AxiosApp.post(url1 + "field_user_dashboard", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data.details;
        if (response.data.statusCode == "200") {

          for (let index = 0; index < l1.length; index++) {
            let element = l1[index]
            let key = element.status.toLowerCase()
            switch (key) {
              case "assigned":
              case "audit assigned": {
                setStartList(startList => [...startList, element]);
                break;
              }
              case "in progress":
              case "audit started":
              case "accepted": {
                setProgressList(progressList => [...progressList, element]);
                break;
              }
              case "audit completed":
              case "report submitted":
              case "report approved":
              case "report rejected":
              case "report accepted": {
                setCompletedList(completedList => [...completedList, element]);
                break;
              }
            }
          }

          loadImageArrays(l1)
        } else {
          //setAlert("error");
          //setAlertMsg(response.data.status);
          return;
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const uploadKML = (e) => {
    let l1 = e.target.files[0].name.lastIndexOf(".")
    let type = e.target.files[0].name.slice(l1 + 1)
    if (type.toLowerCase() != "kml") {
      setAlert("error")
      setAlertMsg("Only kml files are supported")
      return
    }
    setFileImage(e.target.files[0]);
    setFileURL(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
    if (map != '')
      map.remove()

    map = new L.map('map1',
      {
        center: [21.0000, 78.0000], // india coordinates 
        zoom: 5,
        zoomControl: true,
        trackResize: true,
      })
    const osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    map.addLayer(osm);

    var geojsonMarkerOptions = {
      radius: 8,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
    var customLayer = L.geoJson(null, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
      },
      onEachFeature: function (feature, layer) {
        let t1 = Object.keys(feature.properties)
        let t2 = Object.values(feature.properties)
        let t3 = ''

        for (let index = 0; index < t2.length; index++) {
          if (index == 0) t3 = t1[index] + ": " + t2[index]
          else t3 = t3 + "<br/>" + t1[index] + ": " + t2[index]
        }
        layer.bindPopup(t3);
      },
      style: function (feature) {
        return { borderColor: '#ffff', color: '#f00' };
      }
    });
    var kmlLayer1 = window.omnivore.kml(URL.createObjectURL(e.target.files[0]), null, customLayer);
    kmlLayer1.addTo(map)
  }

  const onReject = () => {
    if (!(document.getElementById("comments") &&
      document.getElementById("comments").value)) {
      setAlert("error");
      setAlertMsg("Please add comments for rejection");
    }
    let local1 = new FormData();
    local1.append("audit_id", showObj.audit_id);
    local1.append("action", "Decline");
    local1.append("comments", document.getElementById("comments").value)

    AxiosApp.post(url1 + "audit_accept", local1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          navigate(-1)
          setAlert("success");
          setAlertMsg(response.data.status);
        } else {
          setAlert("error");
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const onAccept = () => {
    let local1 = new FormData();
    local1.append("audit_id", showObj.audit_id);
    local1.append("action", "Accept");
    local1.append("comments", document.getElementById("comments").value)
    local1.append("file_name", filename);
    local1.append(filename, fileImage);

    AxiosApp.post(url1 + "audit_accept", local1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          navigate("/Auditor_survey_overall", { state: { showObj: showObj } })
          setAlert("success");
          setAlertMsg(response.data.status);
        } else {
          setAlert("error");
          setAlertMsg(response.data.status);
        }
      })
      .catch((error) => {
        setIsload(false);
        setAlert("error");
        setAlertMsg(error);
      });
  }

  const loadImageArrays = (array) => {
    setIsload(true)
    let l1 = {}
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      l1 = { audit_type_id: element.audit_type_id };
      let urlArray = []

      AxiosApp.post(url1 + "stretchwise_auditor_img", l1,
        {
          responseType: 'arraybuffer',
          contentType: 'application/zip'
        })
        .then(data => {

          window.scrollTo({ top: 0, behavior: 'smooth' });
          JSZip.loadAsync(data.data)
            .then(zip => {
              setIsload(false);

              // Filter the files to only include image files
              const imageFiles = Object.keys(zip.files)
                .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

              //console.log("BB");                  
              // Read each image file
              imageFiles.forEach((filename, index) => {
                console.log("filename s" + filename);
                let fname = filename.split("/")[0]
                let file = filename.split("/")[1]
                //console.log("DD");

                zip.file(filename)
                  .async('blob')
                  .then(blob => {
                    //console.log("CC");                                       
                    urlArray.push(URL.createObjectURL(blob))
                    imageSource.set(l1.audit_type_id, urlArray)

                  });
              })
              setDummy(Math.random())
            })
            .catch(e => { console.log(e); setIsload(false); })
        })
        .catch(error => {

          window.scrollTo({ top: 0, behavior: 'smooth' });
          setIsload(false); console.error(error)
        });
    }

  }

  const findTheURLs = (search) => {
    //imageSource, find the search
    let returnArray = [];
    for (let [key, value] of imageSource) {
      if (key == search) {
        returnArray = value;
        break;
      }
    }
    return returnArray;
  }

  useEffect(() => {
    loadLists();
  }, [])

  return (
    <div>
      <FUHeader /> <p style={{
        display: "none"
      }}>{dummy}</p>
      <CustomLoader show={isload} />
      {alert != "" && (
        // <CustomAlerts msg={alertMsg} severity={alert}/>
        <CustomAlerts onClose={() => setAlert("")}>
          <p
            style={{
              fontSize: "17px",
              fontWeight: "700",
              marginTop: "17px",
            }}
          >
            {alertMsg}
          </p>
        </CustomAlerts>
      )}
      <div
        style={{
          backgroundColor: "#f1f5f8",
          minHeight: "100vh",
          padding: "20px",
        }}
      //className="rsa_usermanagement"
      >
        <div
          style={{
            margin: "auto",
            width: "100%",
            border: "1px solid rgba(127, 163, 222, 0.3)",
            minHeight: "40vh",
            borderRadius: "10px",
            backgroundColor: "#f8fafc",
            padding: "20px",
          }}
          className="rsa_newuser_add"
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>            

            {/* Search, seeing in grid table are not done,
            <div style={{ display: "flex", alignItems: "center", gap: "10PX" }}>
              <FormControl sx={{ m: 1, width: "200px" }}>
                <InputLabel htmlFor="outlined-adornment-amount">
                  Search
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "black" }} />
                    </InputAdornment>
                  }
                  label="Search"
                />
              </FormControl>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  borderRadius: "10PX",
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "CENTER",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                <GridViewSharpIcon />
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  borderRadius: "10PX",
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "CENTER",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                <FormatListBulletedSharpIcon />
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  borderRadius: "10PX",
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "CENTER",
                  color: "rgba(46, 75, 122, 1)",
                }}
              >
                <FilterListSharpIcon />
              </div>
            </div> */}

          </div>

          <br />
          <div style={{ display: "flex", gap: "15px" }}>
            <Button
              //   variant="contained"
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                backgroundColor: tab == 0 ? "rgba(46, 75, 122, 1)" : "white",
                color: tab == 0 ? "white" : "rgba(46, 75, 122, 1)",
                height: "40px",
                // width: "130px",
              }}
              onClick={() => setTab(0)}
            >
              Assigned
            </Button>
            <Button
              onClick={() => setTab(1)}
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                backgroundColor: tab == 1 ? "rgba(46, 75, 122, 1)" : "white",
                color: tab == 1 ? "white" : "rgba(46, 75, 122, 1)",
                height: "40px",
              }}
            >
              In progress
            </Button>
            <Button
              onClick={() => setTab(2)}
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                backgroundColor: tab == 2 ? "rgba(46, 75, 122, 1)" : "white",
                color: tab == 2 ? "white" : "rgba(46, 75, 122, 1)",
                height: "40px",
              }}
            >
              Completed
            </Button>
          </div>

          {tab == 0 && (
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                  gridAutoRows: "1fr",
                }}
              >
                {startList.map((itm, index) => (
                  <div
                    key={index}
                    style={{
                      //   aspectRatio: "1 / 1", // Ensures width and height are the same
                      padding: "20px",
                      backgroundColor: "white",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          color: "rgba(46, 75, 122, 1)",
                          gap: "3px",
                        }}
                      >

                        <small style={{ fontWeight: "500", fontSize: "18px" }}>
                          ID: {itm.audit_id}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Stretch Name {itm.stretch_name}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Type {itm.type_of_audit}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Road Name : {itm.name_of_road}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Length {itm.stretch_length} Kms
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Audit TypeID {itm.audit_type_id}
                        </small>
                      </div>
                      <Button
                        //   onClick={() => setTab(1)}
                        style={{
                          background:
                            "linear-gradient(94.53deg, #2E4B7A 4.63%, #155DD1 101.12%)",
                          color: "white",
                          width: "100px",
                          // height: "40px",
                        }}
                      >
                        Assigned by {itm.assigned_by}
                      </Button>
                    </div>
                    <div
                      style={{
                        display: "none",
                        justifyContent: "space-between",
                        marginTop: "10PX",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          {findTheURLs(itm.audit_type_id).map((x, i) => {
                            return (
                              <img
                                src={x}
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "100%",
                                  left: i * (-4)
                                }}
                              />
                            )
                          }
                          )
                          }
                        </div>
                        <small
                          style={{
                            fontSize: "14px",
                            fontWeight: "400",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          {findTheURLs(itm.audit_type_id).length} members
                        </small>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Created on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          "Not given"
                        </small>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Start on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          {itm.start_date ? itm.start_date.substr(0, 16) : ''}
                        </small>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Deadline on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          {itm.submit_date ? itm.submit_date.substr(0, 16) : ''}
                        </small>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "10px",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "rgba(255, 199, 0, 1)",
                            color: "black",
                            height: "31px",
                            marginRight: "10px",
                          }}
                          onClick={() => {
                            setButtonClick("view");
                            setShowObj(itm)
                            handleOpen();
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "rgba(0, 186, 117, 1)",
                            color: "white",
                            height: "31px",
                          }}
                          onClick={() => {
                            setButtonClick("start");
                            setShowObj(itm)
                            handleOpen();
                          }}
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {startList.length == 0 &&
                  <span>{"No audits assigned"}</span>}
              </div>
            </div>
          )}
          {tab == 1 && (
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                  gridAutoRows: "1fr",
                }}
              >
                {progressList.map((itm, index) => (
                  <div
                    key={index}
                    style={{
                      //   aspectRatio: "1 / 1", // Ensures width and height are the same
                      padding: "20px",
                      backgroundColor: "white",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          color: "rgba(46, 75, 122, 1)",
                          gap: "3px",
                        }}
                      >

                        <small style={{ fontWeight: "500", fontSize: "18px" }}>
                          ID: {itm.audit_id}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Road Name : {itm.name_of_road}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Length {itm.stretch_length}
                        </small>
                      </div>
                      <Button
                        //   onClick={() => setTab(1)}
                        style={{
                          background:
                            "linear-gradient(94.53deg, #2E4B7A 4.63%, #155DD1 101.12%)",
                          color: "white",
                          width: "100px",
                          // height: "40px",
                        }}
                      >
                        Assigned by {itm.assigned_by}
                      </Button>
                    </div>
                    <div
                      style={{
                        display: "none",
                        justifyContent: "space-between",
                        marginTop: "10PX",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <img
                            src={sampleImg}
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "100%",
                            }}
                          />
                          <img
                            src={sampleImg}
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "100%",
                              position: "relative",
                              left: "-10px",
                            }}
                          />
                          <img
                            src={sampleImg}
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "100%",
                              position: "relative",
                              left: "-16px",
                            }}
                          />
                          <img
                            src={sampleImg}
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "100%",
                              position: "relative",
                              left: "-20px",
                            }}
                          />
                        </div>
                        <small
                          style={{
                            fontSize: "14px",
                            fontWeight: "400",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          4 members
                        </small>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Created on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          "Not given"
                        </small>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Start on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          {itm.start_date ? itm.start_date.substr(0, 16) : ''}
                        </small>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Deadline on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          {itm.submit_date ? itm.submit_date.substr(0, 16) : ''}
                        </small>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "10px",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "rgba(255, 199, 0, 1)",
                            color: "black",
                            height: "31px",
                            marginRight: "10px",
                          }}
                          onClick={() => {
                            setButtonClick("view");
                            setShowObj(itm)
                            handleOpen();
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "rgba(0, 186, 117, 1)",
                            color: "white",
                            height: "31px",
                          }}
                          onClick={() => {
                            setButtonClick("continue");
                            setShowObj(itm)
                            navigate("/Auditor_survey_overall", { state: { showObj: itm } })
                          }}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {progressList.length == 0 &&
                  <span>{"No audit is in progress"}</span>}
              </div>
            </div>
          )}
          {tab == 2 && (
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                  gridAutoRows: "1fr",
                }}
              >
                {completedList.map((itm, index) => (
                  <div
                    key={index}
                    style={{
                      //   aspectRatio: "1 / 1", // Ensures width and height are the same
                      padding: "20px",
                      backgroundColor: "white",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      borderColor: borderColorMap.get(itm.status.toLowerCase()),
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          color: "rgba(46, 75, 122, 1)",
                          gap: "3px",
                        }}
                      >

                        <small style={{ fontWeight: "500", fontSize: "18px" }}>
                          ID: {itm.audit_id}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Stretch Name {itm.stretch_name}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Type {itm.type_of_audit}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Road Name : {itm.name_of_road}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Length {itm.stretch_length}
                        </small>
                        <small style={{ fontWeight: "400", fontSize: "14px" }}>
                          Audit TypeID {itm.audit_type_id}
                        </small>
                      </div>
                      <Button
                        //   onClick={() => setTab(1)}
                        style={{
                          background:
                            "linear-gradient(94.53deg, #2E4B7A 4.63%, #155DD1 101.12%)",
                          color: "white",
                          width: "100px",
                          // height: "40px",
                        }}
                      >
                        Assigned by {itm.assigned_by}
                      </Button>
                    </div>
                    <div
                      style={{
                        display: "none",
                        justifyContent: "space-between",
                        marginTop: "10PX",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          {findTheURLs(itm.audit_type_id).map((x, i) => {
                            return (
                              <img
                                src={x}
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "100%",
                                  left: i * (-4)
                                }}
                              />
                            )
                          }
                          )
                          }
                        </div>
                        <small
                          style={{
                            fontSize: "14px",
                            fontWeight: "400",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          {findTheURLs(itm.audit_type_id).length} members
                        </small>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Created on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          "Not given"
                        </small>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Start on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          {itm.start_date ? itm.start_date.substr(0, 16) : ''}
                        </small>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <small
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          Deadline on :
                        </small>
                        <small
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "14",
                            fontWeight: 600,
                          }}
                        >
                          {itm.submit_date ? itm.submit_date.substr(0, 16) : ''}
                        </small>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "10px",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <span>{itm.status}</span>
                        <span>{" "}</span>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "rgba(255, 199, 0, 1)",
                            color: "black",
                            height: "31px",
                            marginRight: "10px",
                          }}
                          onClick={() => {
                            setButtonClick("view");
                            setShowObj(itm)
                            handleOpen();
                          }}
                        >
                          View
                        </Button>

                        {/* Hide for Field user login
                        {itm.status.toLowerCase() != "report approved" && <Button
                          variant="contained"
                          style={{
                            backgroundColor: "rgb(243, 9, 17)",
                            color: "white",
                            height: "31px",
                          }}
                          onClick={() => {
                            navigate("/Auditor_data", {
                              state: {
                                aid: itm.audit_id,
                                uid: itm.auditor,
                                atypeID: itm.audit_type_id, editMode: false
                              }
                            })
                          }}
                        >
                          Data Analysis
                        </Button>} */}
                      </div>
                    </div>
                  </div>
                ))}
                {completedList.length == 0 &&
                  <span>{"No audits completed"}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AUDITOR DETAILS MODAL */}
      <Modal
        open={open}
        //onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          style={
            buttonClick == "start" ? style : style1
          }
          sx={{
            backgroundColor: "white",
            padding: "20PX",
            height: buttonClick == "view" && "auto !important",
          }}
        >
          <p
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Audit Detail
          </p>
          <div
            style={{
              marginTop: "15px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                border: "1px solid rgba(127, 163, 222, 0.3)",
                width: (buttonClick == "start") ? "58%" : "auto",
                // height: "40vh",
                borderRadius: "10px",
                padding: "15px",
                fontSize: "14px",
                color: "rgba(46, 75, 122, 0.8)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <p>Stretch Id:{showObj.stretch_name}</p>
              <p>Audit Id:{showObj.audit_id}</p>
              <p>State:{showObj.state}</p>
              <p>District:{showObj.district_name}</p>
              <p>Type of Audit: {showObj.type_of_audit}</p>
              <p>Chainage End:{
                showObj.auditor_stretch &&
                showObj.auditor_stretch[showObj.auditor] &&
                showObj.auditor_stretch[showObj.auditor].end_point &&
                showObj.auditor_stretch[showObj.auditor].end_point.replace(".", "+")
              }</p>
              <p>Chainage Start:{
                showObj.auditor_stretch &&
                showObj.auditor_stretch[showObj.auditor] &&
                showObj.auditor_stretch[showObj.auditor].start_point &&
                showObj.auditor_stretch[showObj.auditor].start_point.replace(".", "+")
              }</p>
              <p>Location End:{showObj.latitude_end} {""} {showObj.location_end}</p>
              <p>Location Start:{showObj.latitude_start} {""} {showObj.location_start}</p>
              <p>Auditors list:{showObj.auditor}</p>
              <p>Assigned Auditors Name:{showObj.assigned_by}</p>
              <p>Auditor Id : {showObj.auditor}</p>
              <p>Road Owning Agency : {showObj.road_owning_agency}</p>
            </div>
            {buttonClick == "start" && (
              <div
                style={{
                  // border: "1px solid rgba(127, 163, 222, 0.3)",
                  width: "40%",
                  // height: "40vh",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div id="map1" style={{ width: "100%", height: "300px" }} />

                  <Button
                    // onClick={() => setTab(1)}
                    style={{
                      backgroundColor: "rgba(46, 75, 122, 1)",
                      color: "white",
                      marginTop: "15px",
                    }}
                    title="Upload .kml file for the Audit"
                    onClick={(e) => document.getElementById("addUpload").click()}
                  >
                    <FileUploadOutlinedIcon onClick={(e) => {
                      document.getElementById("addUpload").click();
                    }} /> Upload way-points
                    <input
                      type="file"
                      //accept="kml"
                      id="addUpload"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        //uploadImage(e)
                        uploadKML(e)
                      }
                    />
                  </Button>
                  <small
                    style={{
                      color: "rgba(179, 179, 179, 1)",
                      marginTop: "10px",
                    }}
                  >
                    Upload .kml file only
                  </small>
                </div>
              </div>
            )}
          </div>
          {buttonClick == "start" && (
            <TextField
              style={{ marginTop: "15px" }}
              fullWidth
              multiline
              rows={3}
              label="Comments"
              id="comments"
              variant="outlined"
            />
          )}
          {buttonClick == "start" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <Button
                //   variant="contained"

                //   onClick={() => setTab(0)}
                style={{
                  // border: "1px solid rgba(127, 163, 222, 0.3)",
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  backgroundColor: "#d9e4f6",
                  color: "rgba(46, 75, 122, 1)",
                  height: "40px",
                  // width: "130px",
                }}
                onClick={() => onReject()}
              >
                Declined
              </Button>
              <Button
                //   variant="contained"
                style={{
                  border: "1px solid rgba(127, 163, 222, 0.3)",
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  color: "white",
                  height: "40px",
                  // width: "130px",
                }}
                onClick={() => onAccept()}
              >
                Accept
              </Button>
              <Button
                variant="contained"
                onClick={() => handleClose()}
              >
                Close
              </Button>

            </div>
          )}
          {buttonClick != "start" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <Button
                variant="contained"
                onClick={() => handleClose()}
              >
                Close
              </Button>

            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default FUAudit;

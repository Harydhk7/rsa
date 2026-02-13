import React,{ useEffect, useState } from "react";
import Header from "../Header/Header";
import { Button,  MenuItem,
  Select,
  InputLabel,
  FormControl,TextField } from "@mui/material";
import planimg from "../../Assets/planningimg.png";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { useLocation,useNavigate } from "react-router-dom";
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";
import { url1 } from "../../App";

import L, { icon } from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

var map ='';

function AuditPlanning() {
  //values comes from card click should be props.
  //props.auditID has the auditID from landing page
  const {state} = useLocation()

  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const navigate = useNavigate();
  const [filename, setFilename] = useState("");
  const [fileImage, setFileImage] = useState("");
  const [fileURL, setFileURL] = useState("");   

  const [state1, setState1] = useState("");
  const [district, setDistrict1] = useState("");
  const [state_name, setStateName] = useState("");
  const [district_name, setDistrictName] = useState("");

  const [statesList, setStatesList] = useState([])
  const [districtsList,setDistrictList] = useState([])

  const [roa, setRoa] = useState('')
  const [roaList, setRoaList] = useState([])

  const [atype, setAtype] = useState('')
  const [auditList, setAuditList] = 
  useState(["Blackspot Audit", "Emerging Blackspot Audit", "Journey Risk Assessment", "Part of Crash Investigation", "Redspot Audit", "Stretch Audit", "White Corridor Survey"]) 

  const uploadKML = (e) =>{
    let l1 = e.target.files[0].name.lastIndexOf(".")
    let type = e.target.files[0].name.slice(l1+1)
    if(type.toLowerCase() != "kml"){
      setAlert("error")
      setAlertMsg("Only kml files are supported")
      return
    }
    setFileImage(e.target.files[0]);
    setFileURL(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
    if(map != '') 
      map.remove()

    map = new L.map('mapPlan',
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

        for(let index = 0; index < t2.length; index++) {
          if(index == 0) t3 = t1[index] + ": " + t2[index]
          else t3 = t3 + "<br/>" + t1[index] + ": " + t2[index]
        }
        layer.bindPopup(t3);
      },
      style: function(feature) {
          return { color: '#f00' };
      }
    });
    var kmlLayer1 = window.omnivore.kml(URL.createObjectURL(e.target.files[0]),null,customLayer);
    kmlLayer1.addTo(map)  
  }

  const loadStates = () =>{
      AxiosApp.get("https://rbg.iitm.ac.in/get_details/get_state")
        .then((response) => {
          setIsload(false);
          let l1 = response.data;
          if (response.status == 200) {
            l1 = response.data;
            let t1 = [];
            for (let index = 0; index < l1.length; index++) {          
              let k1 = l1[index]['state_code']
              let v1 = l1[index]['state_name']
              t1.push([k1,v1])          
            }
            setStatesList(t1)
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
  const loadDistrict = (x,y) =>{
    setState1(x)
    setStateName(y)
    AxiosApp.post("https://rbg.iitm.ac.in/get_details/get_district?state="+x)
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      if (response.status == 200) {
        l1 = response.data;
        let t1 = [];
        for (let index = 0; index < l1.length; index++) {          
          let k1 = l1[index]['district_code']
          let v1 = l1[index]['district_name']
          t1.push([k1,v1])          
        }
        setDistrictList(t1)
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
  const loadDropdowns=()=>{
    AxiosApp.post(url1 + "dropdowns")
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      if (response.data.statusCode == "200") { 
        if(l1['road_owning_agency'] != '') {
          let t1 = l1['road_owning_agency']
          setRoaList(t1)
        }
        // if(l1['audit_types'] != '') {
        //   let k1 = Object.keys(l1['audit_types'])
        //   let v1 = Object.values(l1['audit_types'])
        //   let t1 = [];
        //   for (let index = 0; index < k1.length; index++) {
        //     t1.push([k1[index],v1[index]])
        //   }
        //   setAuditList(t1)
        // }
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
  const onSaveProceed = (e) =>{
    //gather all data as formData and post and navigate

    //validation on chainage
    let first1 = document.getElementById("Chainage Start").value;
    let second1 = document.getElementById("Chainage End").value;
    let regex = /^\d+\+\d+$/;
    if(!(regex.test(first1) && regex.test(second1))) {
      setAlert("error");
      setAlertMsg("Please enter correct format for the start and end chainage, eg:0+200");
      return;
    }
    first1 = first1.replace("+",".")
    second1 = second1.replace("+",".")

    //lat long check

    let l1 = document.getElementById("Location Start").value //text
    let l2 = document.getElementById("Location End").value //text

    let l3 = document.getElementById("Latitude Start").value //4.56676,6.56756
    let l4 = document.getElementById("Latitude End").value //4.56676,6.56756

    // regex = /^\d+\.\d+$/;
    // if(!(regex.test(l1) && regex.test(l2) && regex.test(l3) && regex.test(l4))) {
    //       setAlert("error");
    //       setAlertMsg("Please enter correct format for the location and lat/long fields eg:0.0");
    //       return;
    // }

    let local1 = new FormData(); 
      local1.append("audit_type_id", state.auditID);
      local1.append("stretch_name",  document.getElementById("Stretch Name").value);                                                                                                            
      local1.append("state", state1);
      local1.append("district", district);
      local1.append("state_name", state_name);
      local1.append("district_name", district_name);
      local1.append("name_of_road",document.getElementById("Name of Road").value);
      local1.append("road_number", document.getElementById("Road number").value); 
      local1.append("no_of_lanes", document.getElementById("No. of Lanes").value);
      local1.append("road_owning_agency", roa); 
      local1.append("chainage_start", document.getElementById("Chainage Start").value);
      local1.append("chainage_end", document.getElementById("Chainage End").value);
      local1.append("location_start",document.getElementById("Location Start").value);
      local1.append("location_end", document.getElementById("Location End").value);
      local1.append("latitude_start", document.getElementById("Latitude Start").value);
      local1.append("latitude_end", document.getElementById("Latitude End").value);
      local1.append("stretch_length", document.getElementById("Stretch Length").value); 
      local1.append("audit_type", atype)
      local1.append("created_on", new Date().toISOString().slice(0, 10).split('-').reverse().join('-'));
      local1.append("created_by",localStorage.getItem("rsa_user"));
      local1.append("file_name", filename);
      local1.append( filename,fileImage);
    console.log(local1);
    
    AxiosApp.post(url1 + "audit_plan",local1)
    .then((response) => {
      setIsload(false);
      let l1 = response.data;
      if (response.data.statusCode == "200") {        
        console.log(l1)        
        navigate("/Audit")      
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
   useEffect(() => {
      loadStates();
      loadDropdowns(); 
    }, []);
  return (
    <div>
      <Header />
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
          //   minHeight: "100vh",
          padding: "20px",
        }}
        // className="rsa_usermanagement"
      >
        <div
          style={{
            backgroundColor: "#f8fafc",
            minHeight: "90vh",
            width: "100%",
            border: "1px solid rgba(127, 163, 222, 0.3)",
            borderRadius: "10px",
            padding: "15px",
          }}
        >
          <p
            style={{
              fontSize: "26px",
              fontWeight: "600",
              color: "rgba(46, 75, 122, 1)",
            }}
          >
            Audit Planning
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
              marginTop: "20px",
            }}
          >
              <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                // marginTop: "25px",
                gap: "15px",
              }}
            >
              <TextField
                fullWidth
                label="stretch ID "
                id="stretch ID"
                required disabled
                value={state.auditID}
                variant="outlined"
              />{" "}


            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">State</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="State"
                  value={state1}
                  onChange={(e,c)=>loadDistrict(e.target.value,c.props.children)}
                >
                  {
                  statesList.map((x,index)=>                    
                    <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                  )
                  }
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">District</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="District"
                  value={district}
                  onChange={(e,c)=>{
                    setDistrict1(e.target.value);
                    setDistrictName(c.props.children)
                  }}
                >
                  {
                  districtsList.map((x,index)=>                    
                    <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                  )
                  }
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Name of Road"
                id="Name of Road"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Road number"
                id="Road number"
                required
                variant="outlined"
              />
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Road Owing Agency</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="Road Owing Agency"
                  value={roa}
                  onChange={(e)=>setRoa(e.target.value)}
                >
                  {
                  roaList.map((x,index)=>                    
                    <MenuItem key={x} value={x}>{x}</MenuItem>
                  )
                  }
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Chainage Start"
                required
                id="Chainage Start"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Chainage End"
                required
                id="Chainage End"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Location Start"
                id="Location Start"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Location End"
                id="Location End"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Latitude Longitude Start"
                id="Latitude Start"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Latitude Longitude End"
                id="Latitude End"
                required
                variant="outlined"
              />
              
              <TextField
                type="number"
                InputProps={{
                  inputProps: { min: 0 } 
                  }} 
                fullWidth
                id="No. of Lanes"
                label="No. of Lanes"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                id="Stretch Name"
                label="Stretch Name"
                required disabled
                variant="outlined"
                value={state.auditName}
              />
              <TextField
                type="number"
                fullWidth
                id="Stretch Length"
                label="Stretch Length(km)"
                required
                variant="outlined"
              />
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Audit Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="Audit Type"
                  value={atype}
                  onChange={(e)=>setAtype(e.target.value)}
                >
                  {
                  auditList.map((x,index)=>                    
                    <MenuItem key={x} value={x}>{x}</MenuItem>
                  )
                  }
                </Select>
              </FormControl>
            </div>
            <div style={{
              border:"1px solid black",
            }} id="mapPlan"> </div>           
          </div>{" "}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "20px",
            }}
          >
            <Button
              style={{
                backgroundColor: "rgba(46, 75, 122, 1)",
                color: "white",
              }}
              onClick={(e) => onSaveProceed(e)}
            >
              Save & Proceed
            </Button>
            <Button
                style={{
                  backgroundColor: "rgba(46, 75, 122, 1)",
                  color: "white"
                }}
                title="Upload .kml file only"
                onClick={(e)=>document.getElementById("addUpload").click()}
              >
                <FileUploadOutlinedIcon/> Upload Chainage File
                <input
                      type="file"
                      accept="*.kml"
                      id="addUpload"
                      style={{display:"none"}}
                      onChange={(e) => 
                      //  uploadImage(e)
                        uploadKML(e)
                      }
                    />
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditPlanning;

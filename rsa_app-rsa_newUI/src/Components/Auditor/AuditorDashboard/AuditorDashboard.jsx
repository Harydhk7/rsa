import React, { useEffect, useState } from "react";
import ofxhCM02 from "../AuditorHeader/AuditorHeader.jsx";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  useMediaQuery, Button
} from "@mui/material";
import { india_geo } from "../../Dashboard/india.js";
import AxiosApp from "../../../common/AxiosApp";
import { url1 } from "../../../App.js";
import SearchIcon from "@mui/icons-material/Search";
import strimg from "../../../Assets/Stretch.png";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid, GridToolbarQuickFilter, GridRenderCellParams } from '@mui/x-data-grid';
import DescriptionIcon from "@mui/icons-material/Description";

import "../../Dashboard/Dashboard.css"
import { RepeatOneSharp } from "@mui/icons-material";
import L, { icon } from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import MonthlyChart from "../../Dashboard/MonthlyChart";
import AuditorHeader from "../AuditorHeader/AuditorHeader.jsx";
var map = ""
// import { Marker } from "react-leaflet";

export default function AuditorDashboard() {
  const tabletView = useMediaQuery("(max-width:768px)");
  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const [state1, setState1] = useState("");
  const [district, setDistrict1] = useState("");

  const [statesList, setStatesList] = useState([])
  const [districtsList, setDistrictList] = useState([])

  const [roa, setRoa] = useState('')
  const [roaList, setRoaList] = useState([])

  const [role, setRole] = useState("");
  const [userList, setUserList] = useState([])

  const [resData, setResData] = useState([])
  const [kmList, setKmList] = useState([]);
  const [graphRaw, setGraphRaw] = useState([]);
  const [dummy, setDummy] = useState(0);

    const [atype, setAType] = useState("");
    const [atypeList, setatypeList] = useState([])
  
    const [aname, setAName] = useState("");
    const [anameList, setanameList] = useState([])

  const [rows, setRows] = React.useState([
    {
      'id': '', 'audit_type': '', 'stretch_name': '', 'audit_id': '', 'state': '',
      'district_name': '', 'road_owning_agency': '', 'name_of_road': '', 'road_number': '',
      'stretch_length': '', 'status': '', 'auditor': '', 'chainage': '', 'lats': ''
    }]);
  const columns = [
    { field: 'id', flex: 0.5, headerName: 'S.No' },
    //{field: 'audit_type',flex:1,headerName: 'Audit type'},
    { field: 'stretch_name', flex: 1, headerName: 'Stretch Name' },
    { field: 'audit_id', flex: 1, headerName: 'Audit ID' },
    //{field: 'state',flex:1,headerName: 'State'},
    { field: 'chainage', flex: 1, headerName: 'Chainage' },
    { field: 'lats', flex: 1, headerName: 'GPS Coordinates' },
    //{field: 'district_name',flex:1,headerName: 'District Name'},
    { field: 'road_owning_agency', flex: 1, headerName: 'ROA' },
    { field: 'name_of_road', flex: 1, headerName: 'Name of Road' },
    { field: 'road_number', flex: 1, headerName: 'Road No' },
    { field: 'stretch_length', flex: 1, headerName: 'Stretch Length' },
    { field: 'status', flex: 1, headerName: 'Status' },
    { field: 'auditor', flex: 1, headerName: 'Auditor' }
  ];
  function createData(id, audit_type, stretch_name, audit_id, state,
    district_name, road_owning_agency, name_of_road, road_number,
    stretch_length, status, auditor, chainage, lats) {
    return {
      id, audit_type, stretch_name, audit_id, state,
      district_name, road_owning_agency, name_of_road, road_number,
      stretch_length, status, auditor, chainage, lats
    };
  }
  const onClear = () => {
    setRoa('');
    setRole('');
    setState1('');
    setDistrict1('');
    let l1 = {
         "user_id": localStorage.getItem("rsa_user"),
      "road_owning_agency": roa,
      "state": state1,
      "audit_type": atype, //check this
      "audit_name": aname
    }
    loadAPI(l1)
    loadMap(l1)
  }
  const onSubmit = () => {
    //form payload and call loadAPI
    let l1 = {
         "user_id": localStorage.getItem("rsa_user"),
      "road_owning_agency": roa,
      "state": state1,
      "audit_type": atype, //check this
      "audit_name": aname
    }
    let l2 = {
      "user_id": "coersuser1",
      "road_owning_agency": "National Highways Authority of India (NHAI)",
      "user": "la7665",
      "state": "29",
      "district": "756"
    }
    loadAPI(l1)
    loadMap(l1)
  }
  const loadStates = () => {
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
            t1.push([k1, v1])
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
  const loadDistrict = (x) => {
    setState1(x)
    AxiosApp.post("https://rbg.iitm.ac.in/get_details/get_district?state=" + x)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.status == 200) {
          l1 = response.data;
          let t1 = [];
          for (let index = 0; index < l1.length; index++) {
            let k1 = l1[index]['district_code']
            let v1 = l1[index]['district_name']
            t1.push([k1, v1])
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
  const loadDropdowns = () => {
    AxiosApp.post(url1 + "dropdowns")
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          if (l1['road_owning_agency'] != '') {
            let t1 = l1['road_owning_agency']
            setRoaList(t1)
          }
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
  const loadUsers = () => {
    let l1 = {
      "user_id": localStorage.getItem("rsa_user1")
    }
    AxiosApp.post(url1 + "dashboard_dd", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          setUserList(response.data.details)
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
  const loadAPI = (l1) => {
    AxiosApp.post(url1 + "dashboard", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          let l1 = response.data.details;
          let l2 = {
            "assigned_km": l1["assigned_stretch"],
            "total_km": l1["total_stretch_audited"],
            "completed_km": l1["completed_stretch"],
            "inprogress_km": l1["inprogress_stretch"],
            "assigned_count": l1['assigned_count'],
            "completed_count": l1['completed_count'],
            "inprogress_count": l1['inprogress_count']
          }
          setResData(l2)
          if (localStorage.getItem("rsa_type") == "coers" || localStorage.getItem("rsa_type") == "owner")
            setKmList(response.data.details["km's_audited(statewise)"])
          else if (localStorage.getItem("rsa_type") == "lead auditor" || localStorage.getItem("rsa_type") == "auditor")
            setKmList(response.data.details["km's_audited(districtwise)"])
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
  const loadMap = (l1) => {
    let l11 = {
      "user_id": localStorage.getItem("rsa_user1"),
      "road_owning_agency": "National Highways Authority of India (NHAI)",
      "user": "la7665",
      "state": "29",
      "district": "756"
    }
    let roleType = localStorage.getItem("rsa_type")
    if (roleType == "owner" || roleType == "coers") {
      AxiosApp.post(url1 + "dashboard_map_owner", l1)
        .then((response) => {
          setIsload(false);
          let l1 = response.data;
          if (response.data.statusCode == "200") {
            //call this api to populate the geopoints in map
            loadIndia(response.data.location, response.data.audit_location);
          } else {
            loadIndia("")
          }
        })
        .catch((error) => {
          setIsload(false);
          //setAlert("error");
          //setAlertMsg(error);
        });
    } else if (roleType == "lead auditor") {
      AxiosApp.post(url1 + "dashboard_map_la", l1)
        .then((response) => {
          setIsload(false);
          let l1 = response.data;
          if (response.data.statusCode == "200") {
            //call this api to populate the geopoints in map
            loadIndia(response.data.location, response.data.audit_location);
          } else {
            loadIndia("")
          }
        })
        .catch((error) => {
          setIsload(false);
          //setAlert("error");
          //setAlertMsg(error);
        });
    } else if (roleType == "auditor") {
      AxiosApp.post(url1 + "dashboard_map_auditor", l1)
        .then((response) => {
          setIsload(false);
          let l1 = response.data;
          if (response.data.statusCode == "200") {
            //call this api to populate the geopoints in map
            loadIndia(response.data.location, response.data.audit_location);
          } else {
            loadIndia("")
          }
        })
        .catch((error) => {
          setIsload(false);
          //setAlert("error");
          //setAlertMsg(error);
        });
    }

  }
  const loadAuditLists = () => {
    let l1 = { 
         "user_id": localStorage.getItem("rsa_user"),
      "road_owning_agency": roa,
      "state": state1,
      "audit_type": atype, //check this
      "audit_name": aname
    }
    AxiosApp.post(url1 + "audit_details", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          l1 = response.data.details;
          let count = 0;
          let r1 = [];
          for (let element of response.data.details) {
            r1.push(createData(++count, element['audit_type'], element['stretch_name'], element['audit_id'],
              element['state'], element['district_name'], element['road_owning_agency'], element['name_of_road'],
              element['road_number'], element['stretch_length'], element['status'], element['auditor'],
              (element['chainage_start'] + "-" + element['chainage_end']),
              (element['latitude_start'] + "-" + element['latitude_end'])
            ));
          }
          setRows(r1)
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
  // const loadMapStuff = () =>{
  //   var southWest = L.latLng(40.712, -74.227),
  //   northEast = L.latLng(40.774, -74.125),
  //   bounds = L.latLngBounds(southWest, northEast);

  //   var map = L.map('map',
  //     { scrollWheelZoom:false,
  //       //maxBounds: bounds,   // Then add it here..
  //       //maxZoom: 19,
  //       //minZoom: 10
  //       center: [21.0000, 78.0000], // india coordinates 
  //       zoom: 8,
  //       zoomControl: true,
  //       trackResize: true,
  //     }
  //   );
  //   L.tileLayer(
  //     'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       maxZoom: 18
  //     }).addTo(map);
  // }

  const loadIndia = (mapJson, overlayJson) => {
    function getZoneColor(e) {

      return e > 5 ? '#045a8d' :
        e > 4 ? '#74a9cf' :
          e > 3 ? '#a6bddb' :
            e > 2 ? '#d0d1e6' :
              e > 1 ? '#4292c6' :
                e > 0 ? '#2171b5' :
                  '#023858';
    }

    function style_states(feature) {
      return {
        fillColor: 'lightgrey',//getZoneColor(feature.properties.Zone),
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '0',
        fillOpacity: 0.6
      };
    }
    if (map != "") {
      map.remove();
      map.off()
    }
    var southWest = L.latLng(7, 47.6),
      northEast = L.latLng(95.7, 87.30),
      bounds = L.latLngBounds(southWest, northEast);

    let centerpoint = [21.0000, 78.0000];
    try {
      let newV = [];
      let v1 = [];
      if (mapJson.length > 0) {
        let i = mapJson[0].geometry.coordinates
        function f1(x) {
          if (x && (x.length == 2 || x.length == 3)) {
            newV = x;
            return
          } else {
            f1(x[0])
          }
        }
        f1(i);
        if (newV) {
          v1 = newV;
        }
        centerpoint = [v1[1], v1[0]]
      }
    } catch (error) {

    }

    map = L.map('map1',
      {
        //scrollWheelZoom: false,
        //maxBounds: bounds,   // Then add it here..
        //maxZoom: 19,
        //minZoom: 10
        center: centerpoint, // india coordinates 
        zoom: 4,
        zoomControl: true,
        trackResize: true,
      })

    // Add States Layer
    L.geoJson(india_geo, {
      style: style_states,
      // onEachFeature: function (feature, layer) {

      //   layer.bindPopup('<h3>State: '+feature.properties.ST_NM+'</h3>');
      // }
    }).addTo(map);

    // Add OSM tile layer with correct attribution
    //var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    //var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    //var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 12, attribution: osmAttrib});	
    //map.addLayer(osm);  

    // Add Google tile layer with attribution
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);


    /* commenting waypoint codes
    var waypointsArray= [
      [L.latLng(27.74, 81.94),L.latLng(20.6792, 81.949)],
      [L.latLng(22.24, 88.94),L.latLng(22.592, 80.949)],
    ]
    for (let index = 0; index < waypointsArray.length; index++) {
      let element = waypointsArray[index]
      console.log(element);
      var routingControl = L.Routing.control({
        waypoints: element.map((waypoint) => ({
        latLng: waypoint,
        draggable: false,
        })),
        routeWhileDragging: true,
        draggableWaypoints: false,
        addWaypoints: false,
        lineOptions: {
        styles: [{color: 'red', opacity: 1, weight: 3}],
        }
        });
        routingControl.addTo(map);
        routingControl._container.style.display = "none";       
    }
    commenting way points*/

    function styleAssigned() {
      return {
        properties: {
          "strokeColor": "#FFcc00"
        }
      }
    }
    let sampleJSON = [
      {
        "type": "Feature",
        "audit_type_id": "Audit88350",
        "geometry": {
          "coordinates": [
            74.542952336,
            17.366852631
          ],
          "type": "Point"
        },
        "stretch_name": "abcd8561template5182"
      },
      {
        "type": "Feature",
        "audit_type_id": "Audit85570",
        "geometry": {
          "coordinates": [
            65.542952336,
            26.366852631
          ],
          "type": "Point"
        },
        "stretch_name": "test5943"
      },
      {
        "stretch_name": "testwerwer5943",
        "audit_type_id": "Audasfasfasfit85570",
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [[75, 20], [75.4, 20.2], [76, 25]],
        },
        "properties": {
          "strokeColor": "#0000FF"
        }
      }
    ]
    var geojsonMarkerOptions = {
      radius: 6,
      fillColor: "#0000ff",
      color: "#0000ff",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
    //stretch details
    if (mapJson.length > 0) {
      L.geoJson(mapJson, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(
            '<h3>Stretch name: ' + feature.stretch_name +
            '<br/><h3>Stretch ID: ' + feature.audit_type_id + '</h3>' +
            // '<br/><h3>Status: ' + feature.status + '</h3>'+
            '<br/><h3>Chainage: ' + feature.chainage + '</h3>' +
            '<br/><h3>Description: ' + (feature.description ? feature.description : "") + '</h3>' +
            '<br/><h4>Geo Points:' + feature.geometry.coordinates[0] + "," + feature.geometry.coordinates[1]);
        },
        style: function (feature) {
          // if (feature.status === "Audit Started"){
          //   return { color: '#ffa500', fillColor: '#ffa500' };
          // }
          // else if (feature.status === "Assigned"){
          //   return { color: "#ff0014", fillColor: "#ff0014" };
          // }
          // else if (feature.status === "Completed"){
          //   return { color: '#007500', fillColor: '#007500' };
          // }
          // else
          return { color: "#6a5acd", fillColor: "#6a5acd" };
        }
      }).addTo(map);
    } else {
      let t1 = document.getElementsByClassName("leaflet-marker-icon leaflet-zoom-animated leaflet-interactive")
      for (let index = 0; index < t1.length; index++) {
        const element = t1[index];
        element.remove()
      }
    }

    //audit details
    if (overlayJson && overlayJson.length > 0) {
      L.geoJson(overlayJson, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(
            '<h3>Stretch name: ' + feature.stretch_name +
            '<br/><h3>Audit ID: ' + feature.audit_id + '</h3>' +
            '<br/><h3>Status: ' + feature.status + '</h3>' +
            '<br/><h3>Chainage: ' + feature.chainage + '</h3>' +
            '<br/><h3>Description: ' + (feature.description ? feature.description : "") + '</h3>' +
            '<br/><h4>Geo Points:' + feature.geometry.coordinates[0] + "," + feature.geometry.coordinates[1]);
        },
        style: function (feature) {
          if (feature.status === "Audit Planned") {
            return { fillColor: '#ffa500', color: '#ffa500'};
          }
          else if (feature.status === "Audit Assigned") {
            return { fillColor: "#000054", color: "#000054" };
          } 
          else if (feature.status === "Audit Started") {
            return { fillColor: "#edfd07ff", color: "#edfd07ff" };
          }
          else if (feature.status === "Audit Completed") {
            return { fillColor: '#007500', color: '#007500' };
          }
          else if (feature.status === "Report Submitted") {
            return { fillColor: '#f03333ff', color: '#f03333ff' };
          }
          else if (feature.status === "Report Approved") {
            return { fillColor: '#ba21bfff', color: '#ba21bfff' };
          }
          // else if (feature.status === "Report Rejected") {
          //   return { fillColor: '#f7d395', color: '#f7d395' };
          // }
          // else if (feature.status === "Report Submitted") {
          //   return { fillColor: "#ef9ced", color: "#ef9ced" };
          // }
          // else {
          //   return { fillColor: "#000054", color: "#000054" };
          // }
        }
      }).addTo(map);
    } else {
      let t1 = document.getElementsByClassName("leaflet-marker-icon leaflet-zoom-animated leaflet-interactive")
      for (let index = 0; index < t1.length; index++) {
        const element = t1[index];
        element.remove()
      }
    }
  }
  const loadGraph = () => {
    let l1 = {
      "userid": localStorage.getItem("rsa_user1")
    }
    let l2 = {
      "assigned": {
        "2": "10",
        "3": "6",
        "4": "22",
        "5": "10",
        "6": "6",
        "7": "22",
        "8": "10",
        "11": "6",
        "12": "22"
      },
      "completed": {
        "1": "10",
        "2": "6",
        "3": "22",
        "4": "10",
        "5": "6",
        "6": "22",
        "7": "10",
        "8": "6",
        "9": "22"
      }
    }
    AxiosApp.post(url1 + "graph", l1)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.data.statusCode == "200") {
          console.log(response);
          l2 = response.data.details
          let a1 = []
          let c1 = [];

          let oldAss = l2.assigned;
          let oldCom = l2.completed;

          const newAss =
            Object.entries(oldAss).reduce((acc, [key, value]) => {
              acc[parseInt(value)] = parseInt(key);
              return acc;
            }, {});

          const newCom =
            Object.entries(oldCom).reduce((acc, [key, value]) => {
              acc[parseInt(value)] = parseInt(key);
              return acc;
            }, {});

          l2 = {}
          l2.assigned = newAss;
          l2.completed = newCom;

          for (let index = 0; index < 12; index++) {
            l2.assigned && l2.assigned[index + 1] ? a1.push(parseInt(l2.assigned[index + 1])) : a1.push(0)
            l2.completed && l2.completed[index + 1] ? c1.push(parseInt(l2.completed[index + 1])) : c1.push(0)
          }
          setGraphRaw([a1, c1])
          setDummy(Math.random())
          console.log([a1, c1]);
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
    loadUsers();
    onSubmit()
    //loadMapStuff();
    //loadRoute();    
    //loadPoints();
    loadIndia("");
    loadAuditLists();
    loadGraph();
  }, []);
  return (
    <div>
      <AuditorHeader />
      <p style={{
        display: "none"
      }}>{dummy}</p>
      <div
        style={{
          backgroundColor: "#f1f5f8",
          // height: "100vh",
          padding: "20px",
        }}
      >
        <div
          style={{ display: "flex", gap: "20px" }}
          className="rsa_dashborad_parent"
        >
          <div
            style={{
              backgroundColor: "white",
              height: "90vh",
              width: "70%",
              borderRadius: "10px",
              padding: "15px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontSize: "26px", fontWeight: "600" }}>
                Stretch Detail
              </p>
              {/*  not done
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="rsa_dash_mb_serachbar"
              >
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
              </div> */}
            </div>
            <div
              style={{
                width: "99.5%",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
                padding: "15px",
                gap: "8px"
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Road Owing Agency</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="Road Owing Agency"
                  value={roa}
                  onChange={(e) => setRoa(e.target.value)}
                >
                  {
                    roaList.map((x, index) =>
                      <MenuItem key={x} value={x}>{x}</MenuItem>
                    )
                  }
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">State</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="State"
                  value={state1}
                  onChange={(e) => loadDistrict(e.target.value)}
                >
                  {
                    statesList.map((x, index) =>
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
                  onChange={(e) => setDistrict1(e.target.value)}
                >
                  {
                    districtsList.map((x, index) =>
                      <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>
                    )
                  }
                </Select>
              </FormControl>
              {/* <FormControl fullWidth>
                <InputLabel>User Role</InputLabel>
                <Select
                  variant="outlined"
                  defaultValue=""
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {userList.map((x, i) => (
                    <MenuItem key={x} value={x}>{x}</MenuItem>
                  ))}
                </Select>
              </FormControl> */}
              <Button onClick={onSubmit} variant="contained"> Submit</Button>
              <Button onClick={onClear} variant="contained"> Clear</Button>
            </div>
            {/* <div  style={{
              height:"70%"
            }} 
            id="map"></div> */}
            <div style={{
              height: "75%",
              borderRadius: "10px",
            }}
              id="map1"></div>
            <div style={{
              display: "flex",
              flexDirection: "column"
            }}>
               <div style={{ display: "flex", overflow: "scroll" }}>

                <div style={{
                  display: "flex",
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ffa500",
                    color: "#000",
                    margin: "15px",
                    marginLeft: "10px"
                  }}></div>
                  <span style={{ margin: "10px", marginLeft: "0px" }}>Audit Planned</span>
                </div>
                   <div style={{
                  display: "flex",
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#000054",
                    color: "#000",
                    margin: "15px",
                    marginLeft: "10px"
                  }}></div>
                  <span style={{ margin: "10px", marginLeft: "0px" }}>Audit Assigned</span>
                </div>
             
               <div style={{
                  display: "flex",
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#edfd07ff",
                    color: "#000",
                    margin: "15px",
                    marginLeft: "10px"
                  }}></div>
                  <span style={{ margin: "10px", marginLeft: "0px" }}>Audit Started</span>
                </div>
                <div style={{
                  display: "flex",
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#007500",
                    color: "#000",
                    margin: "15px",
                    marginLeft: "10px"
                  }}></div>
                  <span style={{ margin: "10px", marginLeft: "0px" }}>Audit Completed</span>
                </div>
             
              
                <div style={{
                  display: "flex",
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#f03333ff",
                    color: "#000",
                    margin: "15px",
                    marginLeft: "10px"
                  }}></div>
                  <span style={{ margin: "10px", marginLeft: "0px" }}>Report Submitted</span>
                </div>
                <div style={{
                  display: "flex",
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ba21bfff",
                    color: "#000",
                    margin: "15px",
                    marginLeft: "10px"
                  }}></div>
                  <span style={{ margin: "10px", marginLeft: "0px" }}>Report Approved</span>
                </div>
              </div>

            </div>
          </div>

          <div
            style={{
              // backgroundColor: "white",
              height: "90vh",
              width: "30%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              borderRadius: "10px",
            }}
            className="rsa_dashboard_two"
          >
            <div
              style={{
                overflow: "auto",
                backgroundColor: "white",
                height: "30vh",
                width: "100%",
                borderRadius: "10px",
                padding: "15px",
              }}
            >
              <div
                style={{
                  padding:"5px",
                  background: "rgba(221, 232, 250, 1)",
                  //height: "10vh",
                  width: "100%",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "rgba(56, 116, 212, 1)",
                    }}
                  >
                    Total stretch
                    &nbsp; {resData.total_km} kms
                  </p>
                </div>
                <div>
                  <img src={strimg} style={{ width: "100%", height: "50px" }} />
                </div>
              </div>
              <div style={{ marginTop: "10px", padding: "3px", display: "flex", gap: "15px" }}>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    backgroundColor: "rgba(221, 232, 250, 1)",
                    //height: "14vh",
                    justifyContent: "space-between",
                    gap: "5px",
                    borderRadius: "10px",
                    padding:"10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "rgba(56, 116, 212, 1)",
                    }}
                  >
                    Assigned stretch
                  </p>
                  <p
                    style={{
                      // fontSize: "30px",
                      fontWeight: "700",
                      color: "rgba(56, 116, 212, 1)",
                    }}
                  >
                    {resData.assigned_km}  kms&nbsp;
                    audits {resData.assigned_count}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: "10px", padding: "3px", display: "flex", gap: "15px" }}>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    backgroundColor: "rgba(221, 232, 250, 1)",
                    //height: "14vh",

                    justifyContent: "space-between",
                    gap: "5px",
                    borderRadius: "10px",
                    padding:"10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "rgba(56, 116, 212, 1)",
                    }}
                  >
                    In progress stretch
                  </p>
                  <p
                    style={{
                      // fontSize: "30px",
                      fontWeight: "700",
                      color: "rgba(56, 116, 212, 1)",
                    }}
                  >
                    {resData.inprogress_km}  kms&nbsp;
                    audits {resData.inprogress_count}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: "10px", padding: "3px", display: "flex", gap: "15px" }}>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    backgroundColor: "rgba(221, 232, 250, 1)",
                    //height: "14vh",

                    justifyContent: "space-between",
                    gap: "5px",
                    borderRadius: "10px",
                    padding:"10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "rgba(56, 116, 212, 1)",
                    }}
                  >
                    Completed stretch
                  </p>
                  <p
                    style={{
                      // fontSize: "30px",
                      fontWeight: "700",
                      color: "rgba(56, 116, 212, 1)",
                    }}
                  >
                    {resData.completed_km} kms &nbsp;
                    audits {resData.completed_count}
                  </p>
                </div>
              </div>
            </div>
            {!tabletView && (
              <div
                style={{
                  backgroundColor: "white",
                  height: "30vh",
                  width: "100%",
                  borderRadius: "10px",
                  padding: "15px",
                }}
              >
                <p style={{ color: "rgba(46, 75, 122, 1)", fontSize: "16px", fontWeight: 600}}>
                  Kilometers Audited
                </p>
                <div
                  style={{
                    marginTop: "15px",
                    overflowY: "scroll",
                    scrollbarWidth: "thin",
                    height: "20vh",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  {
                    kmList && Object.keys(kmList).map((i, j) => {
                      return (
                        <div
                          style={{ display: "flex", justifyContent: "space-between" }}
                        >
                          <p>{i}</p>
                          <p>{kmList[i]}</p>
                        </div>
                      )
                    })
                  }
                  {
                    kmList && kmList.length == 0 &&
                    <div
                      style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <p>{"No data"}</p>
                    </div>
                  }
                </div>
              </div>
            )}

            <div
              style={{
                backgroundColor: "white",
                height: "30vh",
                width: "100%",
                borderRadius: "10px",
                padding: "15px",
              }}
            >
              <p style={{ fontSize: "16px", fontWeight: 600 }}>
                Monthly Incident Trend
              </p>
              <br/>
              {/* <p
                style={{ display: 'none', fontSize: "30px", fontWeight: 700, marginTop: "7px" }}
              >
                13000 remove this 
              </p>*/}
              {graphRaw != [] && graphRaw[0] && graphRaw[0].length > 0 &&
                <div
                  id="chart_dashboard"
                  style={{
                    // border: "1px solid black",
                    boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                    height: "24vh",
                    borderRadius: "10px",
                  }}
                >
                  <MonthlyChart a={graphRaw[0]}
                    c={graphRaw[1]} />
                </div>}
              {graphRaw == null || graphRaw[0] == null &&
                <div
                  id="chart_dashboard"
                  style={{
                    // border: "1px solid black",
                    boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                    height: "24vh",
                    borderRadius: "10px",
                  }}
                >
                  <MonthlyChart />
                </div>}
            </div>
          </div>
        </div>
        {/* <div
          style={{
            backgroundColor: "white",
            height: "90vh",
            width: "100%",
            borderRadius: "10px",
            padding: "15px",
            marginTop: "25px",
            padding: "20px",
          }}
          className="rsa_str_details"
        >
          <p>
            <span style={{ fontSize: "24px", fontWeight: "600" }}>
              Stretch Details
            </span>
          </p>
          <DataGrid
            sx={{ overflow: 'hidden' }}
            pageSizeOptions={[50, 100, 150]}
            rows={rows}
            columns=
            {columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 50,
                },
              },
              density: 'comfortable',
            }}
            disableRowSelectionOnClick
            //disableColumnFilter
            //disableColumnSelector
            disableDensitySelector
            slots={{
              toolbar: GridToolbarQuickFilter,
            }}
            localeText={{
              toolbarQuickFilterPlaceholder: 'Search in the table'
            }}
          >
          </DataGrid>
        </div> */}
      </div>
    </div>
  );
}

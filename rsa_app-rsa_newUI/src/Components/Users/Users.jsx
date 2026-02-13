import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
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
} from "@mui/material";
import JSZip from 'jszip';
import imgprofile from "../../Assets/FRAME.png";
import EditIcon from "@mui/icons-material/Edit";
import "./Users.css";
import AxiosApp from "../../common/AxiosApp";
import CustomAlerts from "../../common/CustomAlerts";
import CustomLoader from "../../common/customLoader";
import SearchIcon from "@mui/icons-material/Search";
import { url1 } from "../../App";
import db from "../../db/db.js";

// var imageFileSource = new Map()
// var imageSource = new Map()

function Users() {


  function handleSearch() {
    let l1 = document.getElementById('searchString').value;
    searchList(l1)
    return;
  }
  function searchList(l1) {
    //filter the lists
    function filterIt(arrayOfAllObjects, searchKey) {
      let arrayOfMatchedObjects = arrayOfAllObjects.filter(object => {
        return JSON.stringify(object)
          .toString()
          .toLowerCase()
          .includes(searchKey);
      });
      return arrayOfMatchedObjects;
    }
    if (l1) {
      setRows(filterIt(rows, l1))
    } else {
      setRows(rowsOri)
    }
  }
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // // Monitor online/offline status
  // useEffect(() => {
  //   const updateOnlineStatus = () => setIsOnline(navigator.onLine);
  //   window.addEventListener("online", updateOnlineStatus);
  //   window.addEventListener("offline", updateOnlineStatus);

  //   // Load initial data from Dexie
  //   loadPosts();

  //   return () => {
  //     window.removeEventListener("online", updateOnlineStatus);
  //     window.removeEventListener("offline", updateOnlineStatus);
  //   };
  // }, []);

  // auditor 3, lead auditor 2, owner 1, coers 0
  let loadSubTab = 0;
  if (localStorage.getItem("rsa_type") == "lead auditor") {
    loadSubTab = 3;
  } else if (localStorage.getItem("rsa_type") == "owner") {
    loadSubTab = 2;
  }

    // Replace old Maps with this React state
const [imageSources, setImageSources] = useState(new Map());

// Clean up blob URLs when component unmounts or images change (prevents memory leak)
useEffect(() => {
  return () => {
    imageSources.forEach(url => URL.revokeObjectURL(url));
  };
}, [imageSources]);
  const [tab, setTab] = useState(1);
  const [subTab, setSubTab] = useState(loadSubTab);
  const [noData, setNoData] = useState("");

  //common
  const [isload, setIsload] = useState("");
  const [alert, setAlert] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  //adduser
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [dept, setDept] = useState("");
  const [desi, setDesi] = useState("");
  const [role, setRole] = useState("");
  const [cnum, setCnum] = useState("");
  const [altnum, setAltNum] = useState("");
  const [email, setEmail] = useState("");
  const [filename, setFilename] = useState("");
  const [fileImage, setFileImage] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [check1, setCheck1] = useState("");
  const [state1, setState1] = useState("");
  const [district, setDistrict1] = useState("");
  const [state2, setState2] = useState("");
  const [district2, setDistrict2] = useState("");

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictList] = useState([]);

  //userlist
  const [rows, setRows] = useState([]);
  const [rowsOri, setRowsOri] = useState([]);

  // const [dummy, setDummy] = useState(0);

  const loadStates = () => {
    AxiosApp.get("https://rbg.iitm.ac.in/get_details/get_state")
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.status == 200) {
          l1 = response.data;
          let t1 = [];
          for (let index = 0; index < l1.length; index++) {
            let k1 = l1[index]["state_code"];
            let v1 = l1[index]["state_name"];
            t1.push([k1, v1]);
          }
          setStatesList(t1);
          const allowedCities = ["New York", "London", "Paris"];

          // db.state.add(t1);
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
  };
  const loadDistrict = (x, y) => {
    setState1(x);
    setState2(y)
    AxiosApp.post("https://rbg.iitm.ac.in/get_details/get_district?state=" + x)
      .then((response) => {
        setIsload(false);
        let l1 = response.data;
        if (response.status == 200) {
          l1 = response.data;
          let t1 = [];
          for (let index = 0; index < l1.length; index++) {
            let k1 = l1[index]["district_code"];
            let v1 = l1[index]["district_name"];
            t1.push([k1, v1]);
          }
          setDistrictList(t1);
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
  };
  const uploadImage = (e) => {
    setFileImage(e.target.files[0]);
    setFileURL(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (
      !(
        fname !== "" &&
        lname !== "" &&
        dept !== "" &&
        desi !== "" &&
        cnum !== "" &&
        altnum !== "" &&
        email !== "" &&
        role !== "" &&
        state1 !== "" &&
        district !== "" &&
        filename !== ""
      )
    ) {
      setAlert("error");
      setAlertMsg("All fields are mandatory. Please enter all the fields");
      return;
    }

    let local1 = new FormData();
    local1.append("first_name", fname);
    local1.append("last_name", lname);
    local1.append("department", dept);
    local1.append("designation", desi);
    local1.append("contact_number", cnum);
    local1.append("alternate_number", altnum);
    local1.append("email_id", email);
    local1.append("role", role);
    local1.append("state", state1);
    local1.append("district", district);
    local1.append("state_name", state2);
    local1.append("district_name", district2);
    local1.append("file_name", filename);
    local1.append(filename, fileImage);
    local1.append("created_by", localStorage.getItem("rsa_user"))

    if (cnum.length == 10 && parseInt(cnum) > 0) {
      if (cnum[0] == "6" || cnum[0] == "7" || cnum[0] == "8" || cnum[0] == "9") {
      } else {
        setAlert("error");
        setAlertMsg("Enter valid contact number")
        return;
      }
    } else {
      setAlert("error");
      setAlertMsg("Contact number should be of length 10")
      return;
    }
    let emailFilter =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailFilter.test(email)) {
      setAlert("error");
      setAlertMsg("Please enter valid email id")
      return;
    }
    if (navigator.onLine) {
      //online


      setIsload(true);
      // AxiosApp.post(url1 + "add_users", local1)
      //   .then((response) => {
      //     console.log(response,'response')
      //     setIsload(false);
      //     if (response.data.statusCode == "200") {
      //       setFname("");
      //       setLname("");
      //       setDept("");
      //       setDesi("");
      //       setCnum("");
      //       setAltNum("");
      //       setEmail("");
      //       setRole("");
      //       setState1("");
      //       setDistrict1("");
      //       setCheck1("");
      //       setFilename("");
      //       setAlert("success");
      //       setAlertMsg(response.data.status);
      //     } else {
      //          setFname("sdsd");
      //       setLname("");
      //       setDept("");
      //       setDesi("");
      //       setCnum("");
      //       setAltNum("");
      //       setEmail("");
      //       setRole("");
      //       setState1("");
      //       setDistrict1("");
      //       setCheck1("");
      //       setFilename("");
      //       setAlert("error");
      //       setAlertMsg(response.data.status);
      //     }
      //   })
      //   .catch((error) => {
      //     setIsload(false);
      //     setAlert("error");
      //     setAlertMsg(error.message || "Something went wrong");
      //     localStorage.setItem("alertOpen", true);
      //   });
      AxiosApp.post(url1 + "add_users", local1)
      .then((response) => {
        setIsload(false);
    
        const apiData = response.data || {};
        const code = apiData.statusCode;
    
        const isSuccess =
          code === 200 ||
          code === "200" ||
          apiData.status === "Success" ||
          String(apiData.message || "").toLowerCase().includes("successfully registered");
    
        if (isSuccess) {
          setAlert("success");
          setAlertMsg(apiData.message || "User created successfully");
    
          window.alert(
            `User created successfully!\n\n` +
            `User ID: ${apiData.details?.user_id || "—"}\n` +
            `Password: ${apiData.details?.password || "—"}\n\n` +
            `Please note these credentials securely.`
          );
    
          // Force page refresh after success
          window.location.reload();
        } else {
          console.log("Not success → statusCode:", code, apiData);
          setAlert("error");
          setAlertMsg(apiData.message || apiData.status || "Failed to create user");
        }
      })
      .catch((error) => {
        setIsload(false);
        console.error("API error:", error);
    
        let msg = "Something went wrong";
        if (error.response?.data?.message) {
          msg = error.response.data.message;
        } else if (error.message) {
          msg = error.message;
        }
    
        setAlert("error");
        setAlertMsg(msg);
      });
    } else {
      // offline
      try {
        // await db.users.add({
        //   first_name: fname,
        //   last_name: lname,
        //   department: dept,
        //   designation: desi,
        //   contact_number: cnum,
        //   alternate_number: altnum,
        //   email_id: email,
        //   role: role,
        //   state: state1,
        //   district: district,
        //   file_name: filename,
        //   fileImage: fileImage,
        // });

        setIsload(false);
        setAlert("success");
        setAlertMsg("Data saved offline. Will sync when network is available.");
      } catch (error) {
        setIsload(false);
        setAlert("error");
        setAlertMsg("Failed to save offline: " + error.message);
      }
    }
  };

  // Add online event listener
  useEffect(() => {
    const handleOnline = async () => {
      console.log("Network restored. Syncing offline data...");
      const offlineUsers = await db.users.toArray();

      offlineUsers.forEach(async (user) => {
        let formData = new FormData();
        Object.keys(user).forEach((key) => {
          if (key !== "id") {
            formData.append(key, user[key]);
          }
        });

        try {
          const response = await AxiosApp.post(url1 + "add_users", formData);
          if (response.data.statusCode == "200") {
            // Remove the data from Dexie if successfully synced
            await db.users.delete(user.id);
            console.log(`User ${user.first_name} synced successfully.`);
          } else {
            console.log("error");
          }
        } catch (error) {
          console.log("error", error);
        }
      });
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);
  // const loadUserImageList = () => {
  //   //use the subTab as filter option
  //   let l1;
  //   if (subTab == 0) l1 = { role: "CoERS" };
  //   else if (subTab == 1) l1 = { role: "Owner" };
  //   else if (subTab == 2) l1 = { role: "Lead Auditor" };
  //   else if (subTab == 3) l1 = { role: "Auditor" };
  //   else if (subTab == 4) l1 = { role: "AE" };
  //   else if (subTab == 5) l1 = { role: "Field User" };
  //   else {
  //     setAlert("error");
  //     setAlertMsg("Issue in fetching the image details");
  //     return;
  //   }
  //   setIsload(true)
  //   AxiosApp.post(url1 + "userlist_img", l1,
  //     {
  //       responseType: 'arraybuffer',
  //       contentType: 'application/zip'
  //     })
  //     .then(data => {
  //       JSZip.loadAsync(data.data)
  //         .then(zip => {
  //           setIsload(false);
  //           // Filter the files to only include image files
  //           const imageFiles = Object.keys(zip.files)
  //             .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

  //           // Read each image file
  //           let count = 0;

  //           imageFiles.forEach((filename, index) => {
  //             console.log("filename s" + filename);
  //             let fname = filename.split("/")[0]
  //             let file = filename.split("/")[1]
  //             imageFileSource.set(fname, zip.files[imageFiles[index]])

  //             zip.file(filename)
  //               .async('blob')
  //               .then(blob => {
  //                 imageSource.set(fname, URL.createObjectURL(blob))
  //               });
  //           })
  //           setDummy(Math.random())
  //         })
  //         .catch(e => { console.log(e); setIsload(false); })
  //     })
  //     .catch(error => { setIsload(false); console.error(error) });
  // }

  const loadUserImageList = () => {
    let l1;
    if (subTab == 0) l1 = { role: "CoERS" };
    else if (subTab == 1) l1 = { role: "Owner" };
    else if (subTab == 2) l1 = { role: "Lead Auditor" };
    else if (subTab == 3) l1 = { role: "Auditor" };
    else if (subTab == 4) l1 = { role: "AE" };
    else if (subTab == 5) l1 = { role: "Field User" };
    else {
      setAlert("error");
      setAlertMsg("Issue in fetching the image details");
      return;
    }
  
    setIsload(true);
  
    AxiosApp.post(url1 + "userlist_img", l1, {
      responseType: 'arraybuffer',
      contentType: 'application/zip'
    })
      .then(data => {
        JSZip.loadAsync(data.data)
          .then(zip => {
            const imageFiles = Object.keys(zip.files)
              .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));
  
            // Wait for ALL images to load → then update state once
            const loadPromises = imageFiles.map(filename => {
              const fname = filename.split("/")[0];   // user_id
  
              return zip.file(filename)
                .async('blob')
                .then(blob => {
                  const url = URL.createObjectURL(blob);
                  return [fname, url];
                })
                .catch(err => {
                  console.warn(`Failed to load ${filename}`, err);
                  return [fname, null];
                });
            });
  
            Promise.all(loadPromises)
              .then(entries => {
                const validEntries = entries.filter(([_, url]) => url !== null);
                const newMap = new Map(validEntries);
                setImageSources(newMap);
                setIsload(false);
              })
              .catch(err => {
                console.error("Image processing failed", err);
                setIsload(false);
              });
          })
          .catch(e => {
            console.log("JSZip error:", e);
            setIsload(false);
          });
      })
      .catch(error => {
        setIsload(false);
        console.error("API error:", error);
      });
  };
  const loadAllUsers = () => {
    let l1;
    if (subTab == 0) l1 = { filter: "CoERS", userid: localStorage.getItem("rsaLogged") };
    else if (subTab == 1) l1 = { filter: "Owner", userid: localStorage.getItem("rsaLogged") };
    else if (subTab == 2) l1 = { filter: "Lead Auditor", userid: localStorage.getItem("rsaLogged") };
    else if (subTab == 3) l1 = { filter: "Auditor", userid: localStorage.getItem("rsaLogged") };
    else if (subTab == 4) l1 = { filter: "AE", userid: localStorage.getItem("rsaLogged") };
    else if (subTab == 5) l1 = { filter: "Field User", userid: localStorage.getItem("rsaLogged") };
    else {
      setAlert("error");
      setAlertMsg("Issue in fetching the details");
      return;
    }
    setNoData("");
    AxiosApp.post(url1 + "user_list", l1)
      .then((response) => {
        setIsload(false);
        if (response.data.statusCode == "200") {
          console.log(response.data);
          setRows(response.data.details);
          setRowsOri(response.data.details);
          if (response.data.details.length == 0) { setNoData("No users exists"); }
          else { loadUserImageList() }
        } else {
          // setAlert("error");
          //setAlertMsg(response.data.status);
          setRows([]);
          setRowsOri([])
          setNoData("No users exists");
        }
      })
      .catch((error) => {
        setIsload(false);
        //setAlert("error");
        //setAlertMsg(error);
        setRows([]);
        setRowsOri([])
        setNoData("");
      });
  };
  useEffect(() => {
    loadAllUsers();
    loadStates();
  }, []);
  useEffect(() => {
    loadAllUsers();
  }, [subTab]);
  // console.log(imageSource.get("nj0246"), "jkh");
  return (
    <div>
      <Header />
      {/* <p style={{
        display: "none"
      }}>{dummy}</p> */}
      <CustomLoader show={isload} />
      {alert != "" && (
        // <CustomAlerts msg={alertMsg} severity={alert}/>
        <CustomAlerts onClose={() => {
          setAlert("")
        // setFname("")
        }}>
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
          maxHeight: "90vh",
          padding: "20px",
        }}
      //className="rsa_usermanagement"
      >
        <div
          style={{
            backgroundColor: "white",
            //minHeight: "90vh",
            width: "100%",
            borderRadius: "10px",
            padding: "15px",
                            // marginBottom:'20%'

          }}
        >
          <p style={{ fontSize: "26px", fontWeight: "600", color: "rgba(46, 75, 122, 1)" }}>User Management</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <Button
              onClick={() => setTab(1)}
              style={{
                backgroundColor: tab == 1 ? "rgba(46, 75, 122, 1)" : "white",
                color: tab == 1 ? "white" : "rgba(46, 75, 122, 1)",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                fontWeight: 500,
              }}
            >
              User list
            </Button>
            <Button
              onClick={() => setTab(0)}
              style={{
                backgroundColor: tab == 0 ? "rgba(46, 75, 122, 1)" : "white",
                color: tab == 0 ? "white" : "rgba(46, 75, 122, 1)",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                fontWeight: 500,
              }}
            >
              Add User
            </Button>

          </div>
          {tab == 0 && (
            <div
              style={{
                margin: "auto",
                width: "70%",
                border: "1px solid rgba(127, 163, 222, 0.3)",
                height: "75vh",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                padding: "20px",
                marginTop: "10px",
                marginBottom:'20%'
              }}
              className="rsa_newuser_add"
            >
              <div>
                <p
                  style={{
                    fontSize: "29px",
                    fontWeight: "500",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  Add new user
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "rgba(46, 75, 122, 1)",
                  }}
                >
                  General Details
                </p>
              </div>

              <form onSubmit={onSubmit}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "25px",
                  }}
                  className="rsa_user_profile"
                >
                  <div
                    style={{
                      width: "30%",
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <img
                        style={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "50%",
                          backgroundColor: "white",
                          backgroundImage: fileURL,
                        }}
                        src={fileURL ||"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNL_ZnOTpXSvhf1UaK7beHey2BX42U6solRA&s"}
                        alt={""}
                      />
                    </div>
                    <Button
                      onClick={(e) => {
                        document.getElementById("addUpload").click();
                      }}
                      title="Upload an image file for profile picture"
                    >
                      {" "}
                      Upload Profile Picture{" "}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      id="addUpload"
                      style={{ display: "none" }}
                      onChange={(e) => uploadImage(e)}
                    />
                  </div>
                  <div
                    style={{
                      width: "70%",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "15px",
                    }}
                    className="rsa_user_profiledata"
                  >
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        // value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        label="First Name"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        // value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        label="Last Name"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        // value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        label="Department"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        // value={desi}
                        onChange={(e) => setDesi(e.target.value)}
                        label="Designation"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="number"
                        fullWidth
                        // value={cnum}
                        onChange={(e) => {
                          if (e.target.value.length > 10) {
                            e.target.value = e.target.value.slice(0, 10);
                          }
                          setCnum(e.target.value);
                        }}
                        label="Contact Number(Mobile number)"
                        required
                        variant="outlined"
                      />
                    </Grid>


<Grid item xs={12} sm={6}>
                      <TextField
                        type="number"
                        fullWidth
                        value={altnum}
                        onChange={(e) => {
                          if (e.target.value.length > 10) {
                            e.target.value = e.target.value.slice(0, 10);
                          }
                          setAltNum(e.target.value);
                        }}
                        label="Alternate Number(Mobile number)"
                        required
                        variant="outlined"
                      />
                    </Grid>



                    {/* <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        // value={altnum}
                        onChange={(e) => {
                          if (e.target.value.length > 10) {
                            e.target.value = e.target.value.slice(0, 10);
                          }
                          setAltNum(e.target.value);
                        }}
                        label="Alternate Number"
                        required
                        variant="outlined"
                      />
                    </Grid> */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        // value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email ID"
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>User Role</InputLabel>

                        {localStorage.getItem("rsa_type") == "lead auditor" &&
                          <Select
                            variant="outlined"
                            defaultValue=""
                            // value={role}
                            onChange={(e) =>
                              setRole(e.target.value)
                            }
                          >
                            <MenuItem value="AE">AE/IE</MenuItem>
                            <MenuItem value="Auditor">Auditor</MenuItem>
                            <MenuItem value="Field User">Field User</MenuItem>
                          </Select>
                        }

                        {localStorage.getItem("rsa_type") == "coers" &&
                          <Select
                            variant="outlined"
                            defaultValue=""
                            // value={role}
                            onChange={(e) =>
                              setRole(e.target.value)
                            }
                          >
                            <MenuItem value="Field User">Field User</MenuItem>
                            <MenuItem value="Auditor">Auditor</MenuItem>
                            <MenuItem value="AE">AE/IE</MenuItem>
                            <MenuItem value="Lead Auditor">PIU</MenuItem>
                            <MenuItem value="Owner">RO</MenuItem>
                            <MenuItem value="CoERS">CoERS</MenuItem>
                          </Select>
                        }

                        {localStorage.getItem("rsa_type") == "owner" &&
                          <Select
                            variant="outlined"
                            defaultValue=""
                            // value={role}
                            onChange={(e) =>
                              setRole(e.target.value)
                            }
                          >
                            <MenuItem value="Field User">Field User</MenuItem>
                            <MenuItem value="Auditor">Auditor</MenuItem>
                            <MenuItem value="AE">AE/IE</MenuItem>
                            <MenuItem value="Lead Auditor">PIU</MenuItem>
                          </Select>
                        }

                      </FormControl>
                    </Grid>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      // paddingTop: "20px",
                    }}
                  ></div>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "rgb(46, 75, 122)",
                      marginTop: "20px",
                      marginBottom: "10px",
                    }}
                  >
                    Address
                  </p>
                  <div
                    style={{
                      display: "grid",
                      // display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "15px",
                      marginBottom: "20px",
                    }}
                    className="rsa_user_address"
                  >
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          State
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          // value={state1}
                          onChange={(e, c) => loadDistrict(e.target.value, c.props.children)}
                        >
                          {statesList.map((x, index) => (
                            <MenuItem key={x[0]} value={x[0]}>
                              {x[1]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          District
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          // value={district}
                          onChange={(e, c) => {
                            setDistrict1(e.target.value);
                            setDistrict2(c.props.children)
                          }}
                        >
                          {districtsList.map((x, index) => (
                            <MenuItem key={x[0]} value={x[0]}>
                              {x[1]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      // paddingTop: "20px",
                    }}
                  ></div>
                </div>
                <Grid item xs={12} style={{ marginTop: "20px" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        // value={check1}
                        onChange={(e) => {
                          setCheck1(e.target.value);
                        }}
                      />
                    }
                    label="I accept to terms and agreements"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{ textAlign: "center", marginTop: "20px" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    //disabled={!check1}
                    style={{
                      backgroundColor: "rgb(46, 75, 122)",
                      color: "white",
                      width: "70%",
                    }}
                    onClick={onSubmit}
                  >
                    Add
                  </Button>
                </Grid>
              </form>
            </div>
          )}
          {tab == 1 && (
            <div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      // paddingTop: "20px",
                    }}
                  ></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

                {(localStorage.getItem("rsa_type") == "coers" ||
                  localStorage.getItem("rsa_type") == "owner") &&
                  <>
                    <Button
                      onClick={() => setSubTab(0)}
                      style={{
                        backgroundColor:
                          subTab == 0 ? "rgba(46, 75, 122, 1)" : "white",
                        color: subTab == 0 ? "white" : "rgba(46, 75, 122, 1)",
                        border: "1px solid rgba(127, 163, 222, 0.3)",
                        fontWeight: 500,
                      }}
                    >
                      CoERS
                    </Button>
                    <Button
                      onClick={() => setSubTab(1)}
                      style={{
                        backgroundColor:
                          subTab == 1 ? "rgba(46, 75, 122, 1)" : "white",
                        color: subTab == 1 ? "white" : "rgba(46, 75, 122, 1)",
                        border: "1px solid rgba(127, 163, 222, 0.3)",
                        fontWeight: 500,
                      }}
                    >
                      RO
                    </Button>
                  </>}


                {localStorage.getItem("rsa_type") != "lead auditor" &&
                  <Button
                    onClick={() => setSubTab(2)}
                    style={{
                      backgroundColor:
                        subTab == 2 ? "rgba(46, 75, 122, 1)" : "white",
                      color: subTab == 2 ? "white" : "rgba(46, 75, 122, 1)",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      fontWeight: 500,
                    }}
                  >
                    PIU
                  </Button>}

                {/* should come in all 4 */}
                <Button
                  onClick={() => setSubTab(4)}
                  style={{
                    backgroundColor:
                      subTab == 4 ? "rgba(46, 75, 122, 1)" : "white",
                    color: subTab == 4 ? "white" : "rgba(46, 75, 122, 1)",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    fontWeight: 500,
                  }}
                >
                  AE/IE
                </Button>
                <Button
                  onClick={() => setSubTab(3)}
                  style={{
                    backgroundColor:
                      subTab == 3 ? "rgba(46, 75, 122, 1)" : "white",
                    color: subTab == 3 ? "white" : "rgba(46, 75, 122, 1)",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    fontWeight: 500,
                  }}
                >
                  Auditor
                </Button>
                <Button
                  onClick={() => setSubTab(5)}
                  style={{
                    backgroundColor:
                      subTab == 5 ? "rgba(46, 75, 122, 1)" : "white",
                    color: subTab == 5 ? "white" : "rgba(46, 75, 122, 1)",
                    border: "1px solid rgba(127, 163, 222, 0.3)",
                    fontWeight: 500,
                  }}
                >
                  Field User
                </Button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <FormControl sx={{ m: 1, width: "200px" }}>
                  <InputLabel htmlFor="outlined-adornment-amount">
                    Search in Users
                  </InputLabel>
                  <OutlinedInput
                    id="searchString"
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "black" }} />
                      </InputAdornment>
                    }
                    label="Search in Users"
                    onChange={() => handleSearch()}
                  />
                </FormControl>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      border: "1px solid rgba(127, 163, 222, 0.3)",
                      // paddingTop: "20px",
                    }}
                  ></div>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "20px",
                  marginTop: "15px",
                  marginBottom: "15px",
                  maxHeight: "500px",
                  overflow: "auto"
                }}
              >
                {/* {rows.map((itm, idx) => (
                  <div
                    style={{
                      width: "300px",
                      border: "0.85px solid rgba(127, 163, 222, 0.3)",
                      height: "35vh",
                      borderRadius: "10px",
                      padding: "10px",
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
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={imgprofile}
                          alt="image"
                          style={{
                            width: "90px",
                            height: "90px",
                            borderRadius: "50%",
                          }}
                        />
                        <div style={{ color: "rgba(46, 75, 122, 1)" }}>
                          <p style={{ fontSize: "20px", fontWeight: "500" }}>
                            {itm.first_name}
                          </p>
                          <p style={{ fontSize: "10px", fontWeight: "400" }}>
                            user ID :{itm.email}
                          </p>
                          <p style={{ fontSize: "10px", fontWeight: "400" }}>
                            User Role : {itm.role}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          alignItems: "center",
                        }}
                      ></div>
                    </div>
                    <p
                      style={{
                        fontSize: "15px",
                        color: "rgb(46, 75, 122)",
                        marginTop: "10px",
                      }}
                    >
                      Created by : Lead audit
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "12px",
                            fontWeight: "400",
                          }}
                        >
                          Current Status
                        </p>
                        <p
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "13px",
                            fontWeight: "400",
                          }}
                        >
                          {itm.current_status}"current audit"
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            color: "rgba(153, 153, 153, 1)",
                            fontSize: "12px",
                            fontWeight: "400",
                          }}
                        >
                          Upcoming Audit
                        </p>
                        <p
                          style={{
                            color: "rgba(46, 75, 122, 1)",
                            fontSize: "13px",
                            fontWeight: "400",
                          }}
                        >
                          {itm.upcoming_audit}"upcoming audit"
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "105px",
                        border: "0.93px solid rgba(0, 0, 0, 0.1)",
                        marginTop: "20px",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        padding: "10px",
                      }}
                    >
                      <p>
                        <small
                          style={{
                            fontWeight: "600",
                            fontSize: "20px",
                            marginRight: "6PX",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        ></small>
                        <small
                          style={{
                            fontWeight: "400",
                            fontSize: "14px",
                            marginRight: "6PX",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          KMs Audited
                        </small>
                      </p>
                      <p>
                        <small
                          style={{
                            fontWeight: "600",
                            fontSize: "20px",
                            marginRight: "6PX",
                            color: "GREEN",
                          }}
                        >
                          {itm.audits_completed}
                        </small>
                        <small
                          style={{
                            fontWeight: "400",
                            fontSize: "14px",
                            marginRight: "6PX",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          Audits Completed
                        </small>
                      </p>
                      <p>
                        <small
                          style={{
                            fontWeight: "600",
                            fontSize: "20px",
                            marginRight: "6PX",
                            color: "rgba(255, 199, 0, 1)",
                          }}
                        >
                          {itm.pending_audits}
                        </small>
                        <small
                          style={{
                            fontWeight: "400",
                            fontSize: "14px",
                            marginRight: "6PX",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          Pending
                        </small>
                      </p>
                    </div>
                  </div>
                ))} */}
                {rows.map((itm, idx) => (
                  <div
                    style={{
                      width: "345px",
                      border: "0.85px solid rgba(127, 163, 222, 0.3)",
                      // height: "35vh",
                      borderRadius: "10px",
                      padding: "20px",
                    }}
                    title={itm?.state + "," + itm?.district}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        {/* <div
                          style={{
                            color: "white",
                            background:
                              "linear-gradient(90deg, #2E4B7A 0%, #000000 100%)",
                            padding: "10px 15px",
                            borderRadius: "10px",
                            textAlign: "center",
                          }}
                        >
                          Auditor
                        </div> */}
                        <div style={{ marginTop: "15px" }}>
                          <p
                            style={{
                              color: "rgba(46, 75, 122, 1)",
                              fontSize: "28px",
                              fontWeight: 500,
                              width: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={itm.first_name}
                          >
                            {itm.first_name}
                          </p>
                          <p
                            style={{
                              color: "rgba(46, 75, 122, 1)",
                              fontSize: "14px",
                              fontWeight: 600
                            }}
                          >
                            User ID : {itm.user_id}
                          </p>
                          <p
                            style={{
                              color: "rgba(46, 75, 122, 1)",
                              fontSize: "14px",
                              fontWeight: 600,
                              width: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={itm.email}
                          >
                            {itm.email}
                          </p>
                          <br />
                          <p
                            style={{
                              color: "rgba(0, 186, 117, 1)",
                              fontSize: "15px",
                              fontWeight: 400,
                            }}
                          >
                            Created by :
                            <span
                              style={{
                                color: "rgba(0, 186, 117, 1)",
                                fontSize: "15px",
                                fontWeight: 600,
                              }}
                            >
                              {itm.created_by || "-"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <img
                          src={imageSources.get(itm.user_id) ||"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNL_ZnOTpXSvhf1UaK7beHey2BX42U6solRA&s"}
                          style={{
                            width: "124px",
                            height: "129px",
                            borderRadius: "10px",
                          }}
                        />
                      </div>
                    </div>
                    {subTab == 3 && <div
                      style={{
                        border: "1px solid rgba(127, 163, 222, 0.3)",
                        // height: "40px",
                        marginTop: "14px",
                        borderRadius: "10px",
                        padding: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              color: "rgba(153, 153, 153, 1)",
                              fontSize: "12px",
                              fontWeight: "400",
                            }}
                          >
                            Current Status
                          </p>
                          <p
                            style={{
                              color: "rgba(46, 75, 122, 1)",
                              fontSize: "13px",
                              fontWeight: "400",
                            }}
                          >
                            {itm.current_audit || '-'}
                          </p>
                        </div>
                        <hr />
                        <div>
                          <p
                            style={{
                              color: "rgba(153, 153, 153, 1)",
                              fontSize: "12px",
                              fontWeight: "400",
                            }}
                          >
                            Upcoming Audit
                          </p>
                          <p
                            style={{
                              color: "rgba(46, 75, 122, 1)",
                              fontSize: "13px",
                              fontWeight: "400",
                            }}
                          >
                            {itm.upcoming_audit || '-'}
                          </p>
                        </div>
                      </div>
                    </div>}


                    {subTab == 3 &&
                      <div
                        style={{
                          marginTop: "15px",
                          border: "1.17px solid rgba(127, 163, 222, 0.3)",
                          backgroundColor: "#f3f6fc",
                          padding: "7px",
                          borderRadius: "10px",
                          display: "flex",
                          gap: "10px",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          <p style={{ fontSize: "14px", fontWeight: 400 }}>
                            KMs Audited
                          </p>
                          <p style={{ fontSize: "23px", fontWeight: 600 }}>
                            {itm.kms_audited || '-'}</p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          <p style={{ fontSize: "14px", fontWeight: 400 }}>
                            Audits Completed
                          </p>
                          <p
                            style={{
                              fontSize: "23px",
                              fontWeight: 600,
                              color: "rgba(14, 176, 0, 1)",
                            }}
                          >
                            {itm.audits_completed || '-'}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            color: "rgba(46, 75, 122, 1)",
                          }}
                        >
                          <p style={{ fontSize: "14px", fontWeight: 400 }}>
                            Pending
                          </p>
                          <p
                            style={{
                              fontSize: "23px",
                              fontWeight: 600,
                              color: "",
                            }}
                          >
                            {itm.pending_audits || '-'}
                          </p>
                        </div>
                      </div>}
                  </div>
                ))}
                {noData != "" && <p>No Data</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;

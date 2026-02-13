import React from 'react';
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    TextareaAutosize,
    TextField,
    Typography, Select, Checkbox
} from "@mui/material";

import JSZip from 'jszip';
import { url1 } from "../../App";
import Tooltip from '@mui/material/Tooltip';
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { useState, useEffect } from "react";
import AxiosApp from "../../common/AxiosApp";
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    height: "70vh",
    bgcolor: "background.paper",
    borderRadius: "10px",
    // border: "2px solid #000",
    // boxShadow: 24,
    overflowY: "auto",
    scrollBehavior: "smooth",
    p: 4,
};
function EditQuestion(props) {
    const [dummy, setDummy] = useState(0)
    const [isload, setIsload] = useState("");
    const [alert, setAlert] = useState("");
    const [alertMsg, setAlertMsg] = useState("");

    const [auditType, setauditType] = useState(props.auditType)
    const [FieldType, setFieldType] = useState(props.FieldType)
    const [DataType, setDataType] = useState(props.DataType)
    const [allQids, setAllQids] = useState(props.allqids)
    const [AnswerType, setanswerType] = useState(props.AnswerType)

    const [functionality, setfunctionality] = useState()

    const [secAnsDependency, setsecAnsDependency] = useState([])

    const [secQuesIRCBlobs, setsecQuesIRCBlobs] = useState()
    const [newAnswerIRCBlobs, setnewAnswerIRCBlobs] = useState(new Map())
    const [answerObj, setAnswerObj] = useState([])

    const [newQ, setnewQ] = useState('')
    const [newA, setnewA] = useState('')
    const [newF, setnewF] = useState('')
    const [newC, setnewC] = useState('')
    const [newD, setnewD] = useState('')
    const [newI, setnewI] = useState('')
    const [newAT, setnewAT] = useState('')
    const [newQuestionIRCImage, setnewQuestionIRCImage] = useState()
    const [newQuestionIRCBlob, setnewQuestionIRCBlob] = useState(new Map())


    const loadFormData = () => {
        let l1 = {
            "section_id": props.sec_add.split("-")[0],
            "q_id": props.ques_add
        }
        AxiosApp.post(url1 + "question_view", l1)
            .then(function (response) {
                if (parseInt(response.data.statusCode) != 200) {
                    setAlert("error")
                    setAlertMsg(response.data.status)
                    return;
                }
                let l11 = response.data.details;
                let l1 = l11[0]
                setauditType(props.auditType)
                setFieldType(props.FieldType)
                setDataType(props.DataType)
                setAllQids(props.allqids)
                setanswerType(props.AnswerType)

                setnewQ(l1.question)
                if (l1.issues_list == "Yes" || l1.issues_list == "yes") {
                    setnewA("Issue")
                } else
                    setnewA("Inventory")

                setnewF(l1.field_type)
                setnewC(l1.conditions)
                setnewD(l1.data_type)
                setnewI(l1.irc_help_tool)
                setnewAT(l1.functionality)
                setDummy(Math.random())

                //image call
                let local = { "q_id": props.ques_add }
                AxiosApp.post(url1 + "q_irc_imgs", local,
                    {
                        responseType: 'arraybuffer',
                        contentType: 'application/zip'
                    })
                    .then(data => {
                        JSZip.loadAsync(data.data)
                            .then(zip => {
                                setIsload(false);
                                // Filter the files to only include image files
                                const imageFiles = Object.keys(zip.files)
                                    .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

                                // Read each image file
                                let count = 0;

                                imageFiles.forEach((filename, index) => {
                                    console.log("filename s" + filename);
                                    setnewQuestionIRCImage(filename)
                                    zip.file(filename)
                                        .async('blob')
                                        .then(blob => {
                                            setnewQuestionIRCBlob(URL.createObjectURL(blob))
                                            setDummy(Math.random())
                                        });
                                })
                            })
                            .catch(e => { console.log(e); })
                    })
                    .catch(error => {
                        console.error(error);
                    });

            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
                return;
            });
    }
    const sampleAnswerJSON = {
        "show": true,
        "q_sub_id": "a.a",
        "dependency": "b.b",
        "choice": "text",
        "irc": "irc help text",
        "answerImage": "imagename",
        "imagename": "binary of image"
    }
    const fillAnswerDependency = (x) => {
        let l2 = secAnsDependency;
        if (x == "NA") {
            l2 = ["NA"]
            setsecAnsDependency(l2)
            setDummy(Math.random())
            return
        }
        let l1 = {
            "q_id": x
        }
        AxiosApp.post(url1 + "new_dependency", l1)
            .then(function (res) {
                console.log(res);
                if (res.data.statusCode == 200) {
                    l2 = res.data.details
                    setsecAnsDependency(l2)
                    setDummy(Math.random())
                } else {
                    setAlert("error")
                    setAlertMsg(res.data.status)
                    return;
                }
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
                return;
            });
    }
    const saveQuestionIRCImage = (e, id) => {
        if (e.target.files) {
            if (e.target.files[0].type.includes("image")) {
                let file1 = e.target.files[0];
                let blob1 = URL.createObjectURL(file1)
                setnewQuestionIRCBlob(blob1)
                setnewQuestionIRCImage(file1)
                setDummy(Math.random())
            } else {
                setAlert("error")
                setAlertMsg("Please upload image files")
                return;
            }
        }
        return;
    }
    const saveQuestionAnswer = () => {
        let formData = new FormData()

        formData.append("qid", props.ques_add)
        formData.append("road_type_id", props.road_add.split("-")[0])
        formData.append("road_type", props.road_add.split("-")[1])
        formData.append("stage_id", props.stage_add.split("-")[0])
        formData.append("stage", props.stage_add.split("-")[1])
        formData.append("section_id", props.sec_add.split("-")[0])
        formData.append("section_name", props.sec_add.split("-")[1])
        formData.append("question", document.getElementById("new_question").value)
        if (document.getElementById("audit_type").innerText.trim().toLowerCase() == "inventory")
            formData.append("issues_list", "yes")
        else
            formData.append("issues_list", "no")
        formData.append("field_type", document.getElementById("field_type").innerText)
        formData.append("conditions", document.getElementById("condition").innerText)
        formData.append("data_type", document.getElementById("data_type").innerText)
        formData.append("functionality", newAT)
        formData.append("irc_help_tool", document.getElementById("irc_help").value)

        if (newQuestionIRCImage) {
            formData.append("file_name", "questionIRC.png")
            formData.append("questionIRC.png",
                newQuestionIRCImage)
        } else {
            //formData.append("file_name", "")
        }
        let l1 = ""
        AxiosApp.post(url1 + "edit_question", formData)
            .then(function (response) {
                if (response.data.statusCode == "200" || response.data.statusCode == 200) {
                    console.log(response);
                    setAlert("success")
                    setAlertMsg(response.data.status)
                    setDummy(Math.random())
                } else {
                    setAlert("error")
                    setAlertMsg(response.data.status)
                    return;
                }
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                setAlertMsg(error)
                return;
            });
    }
    useEffect(() => {
        loadFormData()
    }, []);
    return (
        <div>
            <Box sx={style}>
                <>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "10px",
                        }}
                    >
                        <Typography
                            id="modal-modal-title"
                            variant="h6"
                            component="h2"
                            style={{ color: "rgba(46, 75, 122, 1)" }}
                        >
                            Edit Question {props.ques_add} in Section {props.sec_add}
                        </Typography>
                    </div>
                    <div
                        style={{
                            border: "1px solid rgba(127, 163, 222, 0.3)",
                            width: "100%",
                            // height: "70vh",
                            marginTop: "15px",
                            borderRadius: "10px",
                            padding: "20px",
                            overflowY: "auto",
                            scrollBehavior: "smooth",
                            // scrol,
                        }}
                    >

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: "10px",
                            }}
                        >
                        </div>
                        <TextField
                            style={{ marginTop: "12px" }}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter your Question here"
                            required
                            id={"new_question"}
                            variant="outlined"
                            value={newQ}
                            onChange={(e) => setnewQ(e.target.value)}
                        />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: "10px",
                                marginTop: "12px",
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>Audit Method Type</InputLabel>
                                <Select
                                    id={"audit_type"}
                                    value={newA}
                                    onChange={(e) => setnewA(e.target.value)}
                                >
                                    {
                                        auditType.map((x, index) =>
                                            <MenuItem key={x} value={x}>{x}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Field Type</InputLabel>
                                <Select
                                    id={"field_type"}
                                    value={newF}
                                    onChange={(e) => setnewF(e.target.value)}
                                >
                                    {
                                        FieldType.map((x, index) =>
                                            <MenuItem key={x} value={x}>{x}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Condition to Display</InputLabel>
                                <Select
                                    id={"condition"}
                                    onChange={(e) => {
                                        //fillAnswerDependency(e.target.value)
                                        setnewC(e.target.value)
                                        setDummy(Math.random())
                                    }}
                                    value={newC}
                                >
                                    {allQids && allQids.map((x, index) =>
                                        <MenuItem key={x} value={x}>{x}</MenuItem>
                                    )}
                                    <MenuItem key={"NA"} value={"NA"}>{"NA"}</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Data Type</InputLabel>
                                <Select
                                    id={"data_type"}
                                    value={newD}
                                    onChange={(e) => setnewD(e.target.value)}
                                >
                                    {
                                        DataType.map((x, index) =>
                                            <MenuItem key={x} value={x}>{x}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                        </div>
                        <div
                            style={{
                                marginTop: "12px",
                                border: "1px solid rgba(127, 163, 222, 0.3)",
                                height: "20vh",
                                borderRadius: "8px",
                                padding: "10px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <p style={{ color: "rgba(46, 75, 122, 1)" }}>IRC Help Tool</p>
                                {
                                    newQuestionIRCBlob &&
                                    <img className={"zoomImageHover"}
                                        src={newQuestionIRCBlob} />
                                }
                                <Button
                                    variant="contained"
                                    component="label"
                                    // fullWidth
                                    margin="normal"
                                    style={{
                                        backgroundColor: "rgba(127, 163, 222, 0.1)",
                                        color: "rgba(46, 75, 122, 1)",
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "10px",
                                        fontSize: "10px",
                                    }}
                                    title="Upload irc help file"
                                >
                                    <FileUploadOutlinedIcon
                                        onClick={(e) => {
                                            document.getElementById("inputFile_irc").click();
                                        }} />
                                    Choose The File
                                    <input type="file" hidden
                                        id={"inputFile_irc"}
                                        onChange={(e) => {
                                            saveQuestionIRCImage(e)
                                            setDummy(Math.random())
                                        }}
                                    />
                                </Button>
                            </div>
                            <hr
                                style={{
                                    border: "1px solid rgba(127, 163, 222, 0.3)",
                                    marginTop: "8px",
                                }}
                            />
                            <TextField
                                style={{ marginTop: "12px" }}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Enter your IRC help here"
                                required
                                id={"irc_help"}
                                variant="outlined"
                                value={newI}
                                onChange={(e) => setnewI(e.target.value)}
                            />
                        </div>
                        <p
                            style={{
                                marginTop: "12px",
                                fontSize: "17px",
                                fontWeight: "600",
                                color: "rgba(46, 75, 122, 1)",
                            }}
                        >
                            Functionality
                        </p>
                        <FormControl disabled fullWidth style={{ marginTop: "15px", marginBottom: "10px" }}>

                            <Select
                                id={"answer_type"}
                                value={newAT}
                                onChange={(e) => setnewAT(e.target.value)}
                            >
                                {
                                    AnswerType && AnswerType.map((x, index) =>
                                        <MenuItem key={x} value={x}>{x}</MenuItem>
                                    )
                                }
                            </Select>
                        </FormControl>
                        {/* save the question and answers */}
                        <br />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button variant="contained"
                            onClick={() => {
                                saveQuestionAnswer()
                            }}
                        >
                            Save this Question
                        </Button>    
                        
                    <Button
                            variant="contained"
                            onClick={() => {
                                props.gobackFromEditQ()
                            }}
                        >
                            Close
                        </Button>  
                        </div>                  
                        <p style={{
                            display: "none"
                        }}>{dummy}</p>
                    </div>
                </>
            </Box>
        </div>
    );
};
export default EditQuestion
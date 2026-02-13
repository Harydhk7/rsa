import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { useState } from "react";
import {
    Checkbox
} from "@mui/material";
import {
    randomId
} from '@mui/x-data-grid-generator';
import AxiosApp from '../../common/AxiosApp';
import { url1 } from '../../App';
import JSZip from 'jszip';
import MasterTableEditableTableDisplay from './MasterTableEditableTableDisplay';
import CustomAlerts from '../../common/CustomAlerts';

const initialRows = [
    {
        id: randomId(),
        sub_q_id: '',
        answer: '',
        irc: '',
        show_option: false
    }
];

function EditToolbar(props) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [
            ...oldRows,
            { id, sub_q_id: '', answer: '', isNew: true },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <GridToolbarContainer style={{display:"flex", justifyContent:"flex-end"}}>
            {/* commenting as there is gonna be only view */}
            <Button color="primary" variant="contained" startIcon={<AddIcon />} onClick={handleClick}>
                Add record
            </Button>
        </GridToolbarContainer>
    );
}

export default function MasterTableEditableTable(popProps) {
    console.log(popProps);
    const [alert, setAlert] = useState("");
    const [alertMsg, setAlertMsg] = useState("");

    const [rows, setRows] = React.useState(initialRows);
    const [rowModesModel, setRowModesModel] = React.useState({});
    const [ansIds, setAnsIds] = React.useState({})
    const [ansImage, setAnsImage] = React.useState(new Map())
    const [ansBlob, setAnsBlob] = React.useState(new Map())
    const [dummy, setDummy] = React.useState(0)
    const [choiceImageId, setchoiceImageId] = React.useState(new Map())

    //from display datagrid => checkbox alone
    const [masterShowArray, setMasterShowArray] = React.useState([])

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id) => () => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };
    const handleSaveMaster = () => {
        //here 2 axios calls should make
        //call master_table_edit and send the "checked" column of the MasterTableEditableTableDisplay
        var l11 = {
            "q_sub_ids": masterShowArray
        }
        AxiosApp.post(url1 + "master_table_edit", l11)
            .then(function (res) {
                if (res.data.statusCode == "200") {
                    setAlert("success")
                    setAlertMsg(res.data.status)
                    loadRows()
                    return;
                }
                else {
                    setAlert("error")
                    setAlertMsg(res.data.status)
                    return;
                }
            });
        //call axios call and save the master table data - newly added
        console.log(popProps.id);
        console.log(rows)
        let answerJson = {}
        let formData = new FormData()
        for (let index = 0; index < rows.length; index++) {
            let row = rows[index]
            let localJson = {
                "master_table": row.answer,
                "dependency_dd": "NA",
                "irc_help_tool": row.irc_help_tool,
                //"file_name": "choice" + index + ".png",
                "show_option": row.show_option ? true : false,
                //"sub_q_id":row.sub_q_id
            }
            answerJson["choice" + index] = localJson
            if (ansImage.get(row.id)){
                formData.append("choice" + index + ".png",
                    ansImage.get(row.id))
                localJson.file_name = "choice" + index + ".png"
            }
            else {
                //formData.append("choice" + index + ".png", "")
                //localJson.file_name = ""
            }
        }
        let t1 = popProps.id
        let answer1 = {
            "choices": answerJson
        }
        formData.append("q_id", t1)
        formData.append("road_type_id", t1.split(".")[0])
        formData.append("stage_id", t1.split(".")[1])
        formData.append("section_id", t1.split(".")[2])
        formData.append("sub_questions", JSON.stringify(answer1))
        AxiosApp.post(url1 + "master_table_add", formData)
            .then(function (res) {
                if (res.data.statusCode == "200") {
                    setAlert("success")
                    setAlertMsg(res.data.status)
                    setDummy(Math.random())
                    return;
                }
                else {
                    setAlert("error")
                    setAlertMsg(res.data.status)
                    return;
                }
            })
            .catch(function (error) {
                console.log(error); 
                setAlert("error")
                setAlertMsg(error)
            });
    }
    const columns = [
        {
            field: 'show_option',
            headerName: 'Show',
            flex:1,
            renderCell: (params) => {
                return (
                    <Checkbox checked={params.row.show_option}
                        onChange={(e) => {
                            let t1 = rows;
                            let i = t1.map(i => i.sub_q_id).indexOf(params.row.sub_q_id);
                            t1[i].show_option = e.target.checked
                            setRows(t1)
                            setDummy(Math.random())
                        }}
                    />)
            }
        },
        { field: 'sub_q_id', headerName: 'Sub-question Id',flex:1, editable: false },
        {
            field: 'answer',
            headerName: 'Choices',
            flex:1,
            align: 'left',
            headerAlign: 'left',
            editable: true,
        },
        {
            field: 'irc_help_tool',
            headerName: 'IRC help',
            flex:1,
            cellClassName: 'irc',
            editable: true
        },
        {
            field: 'optionImage',
            type: 'image',
            headerName: 'Option Image',
            flex:1,
            cellClassName: 'optionImage',
            renderCell: (params) => {
                return (<img className={"zoomImageHover"} alt={""}
                    src={ansBlob.get(params.row.id)} />)
            }
        },
        {
            field: 'upload',
            type: 'file',
            headerName: 'Upload',
            flex:1,
            cellClassName: 'upload',
            renderCell: (params) => {
                return (
                    <input type="file"
                        onChange={(e) => {
                            let i1 = e.target.files[0]
                            let t1 = ansImage;
                            t1.set(params.row.id, i1)
                            setAnsImage(t1)
                            let t2 = ansBlob;
                            t2.set(params.row.id, URL.createObjectURL(i1))
                            setAnsBlob(t2)
                            setDummy(Math.random())
                        }}
                    />)
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
           flex:1,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                        style={{ display: "none" }}
                    />,
                ];
            },
        },

    ];
    const loadRows = () => {
        let secId = popProps.id.split(".")[2]
        let l1 = {
            "section_id": secId,
            "q_id": popProps.id
        }
        let t1 = [];
        AxiosApp.post(url1 + "master_table_view", l1)
            .then(function (response) {
                if (parseInt(response.data.statusCode) != 200) {                    
                    setAlert("error")
                    setAlertMsg(response.data.status)
                    return;
                }
                console.log(response);
                let allData = response.data.details
                let m1 = new Map()
                //add random id in each object and set the rows
                for (let i = 0; i < allData.length; i++) {
                    allData[i].id = randomId()
                    t1.push(allData[i].sub_q_id)
                    if (allData[i].irc_path)
                        m1.set(allData[i].irc_path, allData[i].sub_q_id)
                }
                setRows(allData)
                setAnsIds(t1)
                setchoiceImageId(m1)
                setDummy(Math.random())
                loadImages(t1, m1)
            })
            .catch(function (error) {
                console.log(error);
                setAlert("error")
                    setAlertMsg(error)
            });
    }
    const loadImages = (t1, m1) => {
        let t_image = new Map()
        let t_blob = new Map()
        for (let index = 0; index < t1.length; index++) {
            t_image.set(t1[index], "")
            t_blob.set(t1[index], "")
        }
        setAnsImage(t_image)
        setAnsBlob(t_blob)
        let local = { "q_id": popProps.id }
        AxiosApp.post(url1 + "option_images", local,
            {
                responseType: 'arraybuffer',
                contentType: 'application/zip'
            })
            .then(data => {
                JSZip.loadAsync(data.data)
                    .then(zip => {
                        // Filter the files to only include image files
                        const imageFiles = Object.keys(zip.files)
                            .filter(filename => /\.(jpe?g|png|gif|webp)$/i.test(filename));

                        // Read each image file
                        let count = 0;

                        imageFiles.forEach((filename, index) => {

                            zip.file(filename)
                                .async('blob')
                                .then(blob => {
                                    let t1 = m1.get(filename)
                                    t_blob.set(t1, URL.createObjectURL(blob))
                                    t_image.set(t1, filename)
                                });
                        })
                        setAnsImage(t_image)
                        setAnsBlob(t_blob)
                        setDummy(Math.random())
                    })
                    .catch(e => { console.log(e); })
            })
            .catch(error => { console.error(error); });
    }
    const handleCallBackSaveIds = (arr) =>{
        setMasterShowArray(arr)
    }
    React.useEffect(() => {
        // loadRows()
    }, []);
    return (
        <Box
            id="editable_master_table"
            sx={{
                height: "auto",
                width: '100%',
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
            }}
        >
            <p style={{
                display: "none"
            }}>{dummy}</p>
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

            <MasterTableEditableTableDisplay id={popProps.id} 
            callBackSaveIds={handleCallBackSaveIds}/>

            <br/>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{ toolbar: EditToolbar }}
                slotProps={{
                    toolbar: { setRows, setRowModesModel },
                }}
            />  
            <br/>

            <Button variant="contained" onClick={handleSaveMaster}>
                Save Master Table record
            </Button>
        </Box>
    );
}

import { CiFilter } from "react-icons/ci";
import { Button, OutlinedInput } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import DataTable from "react-data-table-component";
import { columns } from "../employee/employeehelper";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FiDownload } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { BiGroup } from "react-icons/bi";
import { GoPlus } from "react-icons/go";
import { useState } from "react";
import MarkAttandence from "./MarkAttandence";

const Attandence = () => {
  const [markattandence, setmarkattandence] = useState(false);
  const [isUpdate, setisUpdate] = useState(false);
  const [isload, setisload] = useState(false);
  const [openmodal, setopenmodal] = useState(true);
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: 'teal', // header background
        fontWeight: 'bold',         // font weight
        fontSize: '14px',
        color: 'white',             // header cell height
        padding: '0px 5px',
      },
    },
    headRow: {
      style: {
      },
    },
    rows: {
      style: {
        minHeight: '48px',          // height of each row
      },
    },
  };

  return (
    <div className='p-8'>
      <div className="text-2xl text-gray-900 mb-8">Attendance Tracker</div>
      <div className="bg-white flex flex-col rounded mb-8 p-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex p-1 items-center gap-2 bg-gray-100">
            <p onClick={() => setmarkattandence(false)} className={`px-2 py-1 rounded cursor-pointer ${!markattandence && `  bg-white`}`}>View Attendance</p>
            <p onClick={() => setmarkattandence(true)} className={`px-2 py-1 rounded cursor-pointer ${markattandence && `  bg-white`}`}>Mark Attendance</p>
          </div>

          <div className="flex gap-2">
            <Button variant='contained' color="error" startIcon={<AiOutlineDelete />} >Delete ({2})</Button>
            <Button variant='outlined' startIcon={<FiDownload />} >Export</Button>
          </div>
        </div>
        <div className="flex items-center gap-4 ">
          {markattandence ?
            <div className="flex p-1 items-center gap-2">
              <Button variant='contained' color="secondary" startIcon={<GoPlus />} >Mark Indivisual</Button>
              <Button variant='outlined' color="success" startIcon={<BiGroup />} >Mark Bulk</Button>
            </div> :
            <div className="flex items-center gap-4 ">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }} label="Delect date" />
              </LocalizationProvider>
              <FormControl sx={{ width: '160px' }} required size="small">
                <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={""}
                  name="Department"
                  label="Department"
                  input={
                    <OutlinedInput
                      startAdornment={
                        <InputAdornment position="start">
                          <CiFilter fontSize="small" />
                        </InputAdornment>
                      }
                      label="Department"
                    />
                  }
                // onChange={(e) => handleChange(e, 'department')}
                >

                  <MenuItem value={""}>Sales</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ width: '160px' }} required size="small">
                <InputLabel id="demo-simple-select-helper-label">Status</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={""}
                  name="Department"
                  label="Department"
                  input={
                    <OutlinedInput
                      startAdornment={
                        <InputAdornment position="start">
                          <CiFilter fontSize="small" />
                        </InputAdornment>
                      }
                      label="Department"
                    />
                  }
                // onChange={(e) => handleChange(e, 'department')}
                >

                  <MenuItem value={""}>Sales</MenuItem>
                </Select>
              </FormControl>
            </div>
          }

        </div>
      </div>
      <div>
        <DataTable
          columns={columns}
          pagination
          selectableRows
          customStyles={customStyles}
          highlightOnHover
        />
      </div>
      <MarkAttandence openmodal={openmodal} 
      setopenmodal={setopenmodal} isUpdate={isUpdate} isload={isload}
       />
    </div>
  )
}

export default Attandence

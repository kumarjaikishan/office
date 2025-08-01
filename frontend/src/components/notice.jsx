// src/components/OfficialNoticeBoard.jsx
import React, { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, IconButton
} from '@mui/material';

const employeeTypes = ['All', 'Staff', 'Manager', 'HR'];
const noticeTypes = ['Holiday', 'Policy', 'Event', 'Urgent'];

const OfficialNoticeBoard = ({ notices = [], onDelete, onSave }) => {
  const [open, setOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const [form, setForm] = useState({
    title: '',
    date: '',
    employeeType: '',
    noticeType: ''
  });

  const handleOpen = (notice = null) => {
    setEditingNotice(notice);
    if (notice) {
      setForm({
        title: notice.title,
        date: notice.date,
        employeeType: notice.employeeType,
        noticeType: notice.noticeType
      });
    } else {
      setForm({ title: '', date: '', employeeType: '', noticeType: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setEditingNotice(null);
    setOpen(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ ...form, id: editingNotice?.id || Date.now() });
    }
    handleClose();
  };

  return (
    <div className="bg-white h-full shadow-lg rounded-lg p-4 w-full md:w-[350px]">
      <div className="flex items-center justify-between mb-2 border-b pb-1">
        <h3 className="text-lg font-bold">📌 Official Notices</h3>
        <Button size="small" variant="contained" onClick={() => handleOpen()}>
          Add
        </Button>
      </div>

      {notices?.length ? (
        <ul className="space-y-2 text-sm h-[300px] overflow-y-auto">
          {notices.map((notice, idx) => (
            <li key={idx} className="border-l-4 border-blue-500 pl-2 relative group">
              <p className="font-semibold">{notice.title}</p>
              <p className="text-gray-600 text-xs">{notice.date}</p>

              <div className="absolute right-1 top-1 hidden group-hover:flex gap-1">
                <IconButton size="small" onClick={() => handleOpen(notice)}>
                  <MdEdit className="text-blue-500" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete && onDelete(notice.id)}>
                  <MdDelete className="text-red-500" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No official notices available.</p>
      )}

      {/* Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingNotice ? "Edit Notice" : "Add Notice"}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 mt-2">
          <TextField
            label="Notice Title"
            fullWidth
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <TextField
            select
            label="Type of Employee"
            fullWidth
            value={form.employeeType}
            onChange={(e) => setForm({ ...form, employeeType: e.target.value })}
          >
            {employeeTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Type of Notice"
            fullWidth
            value={form.noticeType}
            onChange={(e) => setForm({ ...form, noticeType: e.target.value })}
          >
            {noticeTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingNotice ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OfficialNoticeBoard;

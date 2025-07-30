import { IconButton } from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";

export const getLedgerColumns = (handleEditEntry, handleDeleteEntry) => [
  {
    name: "S.no",
    selector: (row) => row.sno,
    width: '60px'
  },
  {
    name: "Date",
    selector: (row) => row.date
  },
  {
    name: "Particulars",
    selector: (row) => row.particular
  },
  {
    name: "Debit",
    selector: (row) => row.debit || '-'
  },
  {
    name: "Credit",
    selector: (row) => row.credit || '-'
  },
  {
    name: "Balance",
    selector: (row) => row.balance,
    width: '90px'
  },
  {
    name: "Action",
    cell: (row) => (
      <>
        <IconButton size="small" onClick={() => handleEditEntry(row)}><MdEdit /></IconButton>
        <IconButton size="small" onClick={() => handleDeleteEntry(row._id)}><MdDelete /></IconButton>
      </>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true
  }
];

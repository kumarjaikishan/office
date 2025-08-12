import { IconButton } from "@mui/material";
import dayjs from "dayjs";
import { MdDelete, MdEdit } from "react-icons/md";

export const getLedgerColumns = (handleEdit, handleDelete) => [
    {
        name: "S.No",
        selector: (row, index) => index + 1,
        width: "60px",
    },
    {
        name: 'Date',
        selector: row => dayjs(row.date).format('DD MMM, YYYY'),
        sortable: true,
    },
    {
        name: 'Particular',
        selector: row => row.particular,
    },
    {
        name: 'Debit',
        selector: row => row.debit,
        width: '90px'
    },
    {
        name: 'Credit',
        selector: row => row.credit,
        width: '90px'
    },
    {
        name: 'Balance',
        selector: row => row.balance,
    },
    {
        name: 'Actions',
        cell: (row) => (
            <>
                <MdEdit className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit Entry" onClick={() => handleEdit(row)} style={{ cursor: 'pointer', marginRight: 10 }} />
                <MdDelete className="delete text-[18px] text-red-500 cursor-pointer" title="Delete Entry" onClick={() => handleDelete(row._id)} style={{ cursor: 'pointer' }} />
            </>
        ),
        width: '120px',
    }
];

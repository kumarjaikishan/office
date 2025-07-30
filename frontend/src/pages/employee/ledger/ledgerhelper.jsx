import { IconButton } from "@mui/material";
import dayjs from "dayjs";
import { MdDelete, MdEdit } from "react-icons/md";

export const getLedgerColumns = (handleEdit, handleDelete) => [
    {
        name: 'S.No',
        selector: row => row.sno,
        width: '60px'
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
                <MdEdit title="Edit Entry" onClick={() => handleEdit(row)} style={{ cursor: 'pointer', marginRight: 10 }} />
                <MdDelete title="Delete Entry" onClick={() => handleDelete(row._id)} style={{ cursor: 'pointer' }} />
            </>
        ),
        width: '120px',
    }
];

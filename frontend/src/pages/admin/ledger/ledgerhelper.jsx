import { IconButton } from "@mui/material";
import dayjs from "dayjs";
import { useEffect } from "react";
import { MdDelete, MdEdit } from "react-icons/md";


export const getLedgerColumns = (handleEdit, handleDelete, employee, navigate) => [
    {
        name: "S.No",
        selector: (row, index) => index + 1,
        width: "40px",
    },
    {
        name: 'Date',
        selector: row => dayjs(row.date).format('DD MMM, YYYY'),
        sortable: true,
        width: "90px",
    },
    {
        name: 'Particular',
        selector: row => row.particular,
    },
    {
        name: 'Debit',
        selector: row => (parseFloat(row.debit) === 0 ? "" : row.debit), //row.debit.toFixed(2)
        width: '90px'
    },
    {
        name: 'Credit',
        selector: row => (parseFloat(row.credit) === 0 ? "" : row.credit),
        width: '90px'
    },
    {
        name: 'Balance',
        selector: row => row.balance,
        width: '90px'
    },
    {
        name: 'Actions',
        cell: (row) => {
            if (row.source === 'advance') {
                return (
                    <span
                        className="text-blue-600 text-sm cursor-pointer underline"
                        onClick={() => {
                            const emp = employee.find(
                                (val) => val?.ledgerId === row.ledgerId
                            );

                            if (!emp) return;

                            navigate(
                                `/dashboard/advance?employeeId=${emp._id}`,
                                { replace: true }
                            );
                        }}
                    >
                        View Advance
                    </span>
                )
            }
            // 🔹 If salary → show text only
            if (row.source === "salary") {
                return `From salary`;
            }

            // 🔹 Default edit/delete
            return (
                <>
                    <MdEdit
                        className="edit text-[18px] text-blue-500 cursor-pointer mr-2"
                        title="Edit Entry"
                        onClick={() => handleEdit(row)}
                    />
                    <MdDelete
                        className="delete text-[18px] text-red-500 cursor-pointer"
                        title="Delete Entry"
                        onClick={() => handleDelete(row._id)}
                    />
                </>
            );
        },
        width: '120px',
    }
];

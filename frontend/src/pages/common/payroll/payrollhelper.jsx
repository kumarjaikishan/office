import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { BiEdit, BiTrash, BiShow } from "react-icons/bi"; // react-icons
import { cloudinaryUrl } from "../../../utils/imageurlsetter";

export const payrollColumns = (
  handleGenerate,
  handleView,
  handleEdit,
  handleDelete,
  canCreate,
  canView,
  canEdit,
  canDelete,
  payrollMap,
  selectedMonth,
  selectedYear
) => {
  return [
    {
      name: "S.no",
      selector: (row, ind) => ind + 1,
      width: "60px",
    },
    {
      name: "Employee",
      selector: (row) => (
        <div className="flex items-center capitalize gap-3">
          <Avatar
            src={
              cloudinaryUrl(row?.profileimage, {
                format: "webp",
                width: 100,
                height: 100,
              })
            }
            alt={row?.userid?.name}
          >

          </Avatar>
          <Box>
            <Typography variant="body2">{row?.userid?.name}</Typography>
            <p className="text-[10px] text-gray-600">
              ({row?.designation || "-"})
            </p>
          </Box>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Department",
      selector: (row) => row.department?.department || "-", // <-- get the string
      width: "120px",
    },

    {
      name: "Actions",
      cell: (row) => {
        const key = `${row._id}-${selectedMonth}-${selectedYear}`;
        const exists = payrollMap?.[key]; // check if payroll already generated

        return (
          <Stack direction="row" spacing={1}>
            {canCreate && (
              <Button
                size="small"
                variant="contained"
                disabled={exists}
                onClick={() => handleGenerate(row)}
              >
                Generate
              </Button>
            )}
            {canView && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<BiShow />}
                onClick={() => handleView(row)}
              >
                View
              </Button>
            )}
            {canEdit && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<BiEdit />}
                onClick={() => handleEdit(row)}
              >
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<BiTrash />}
                onClick={() => handleDelete(row._id)}
              >
                Delete
              </Button>
            )}
          </Stack>
        );
      },
      width: "450px",
    },
  ];
};

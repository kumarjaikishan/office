import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { BiEdit, BiTrash, BiShow } from "react-icons/bi"; // react-icons
import { cloudinaryUrl } from "../../../utils/imageurlsetter";


export const payrollColumns = (onView, onEdit, onDelete,canView,canEdit,canDelete) => {
  return [
    {
      name: "S.no",
      selector: (row, ind) => ind + 1,
      width: "60px",
    },
    {
      name: "Employee",
      selector: (row) => (
        <div className="flex items-center capitalize gap-3 ">
          <Avatar
            src={cloudinaryUrl(row?.employeeId?.profileimage, {
              format: "webp",
              width: 100,
              height: 100,
            }) || employepic}
            alt={row?.employeeId?.userid?.name}
          >
            {!row?.employeeId?.profileimage && employepic}
          </Avatar>
          <Box>
            <Typography variant="body2">{row?.employeeId?.userid?.name}</Typography>
            <p className="t text-[10px] text-gray-600">
              ({row?.employeeId?.designation})
            </p>
          </Box>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Month",
      selector: (row) => dayjs(`${row.year}-${row.month}-01`).format("MM-YYYY"),
    },
    {
      name: "Department",
      selector: (row) => row.department,
      width: "120px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            disabled={!canView}
            startIcon={<BiShow />}
            onClick={() => onView(row)}
          >
            View
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            disabled={!canEdit}
            startIcon={<BiEdit />}
            onClick={() => onEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={!canDelete}
            startIcon={<BiTrash />}
            onClick={() => onDelete(row._id)}
          >
            Delete
          </Button>
        </Stack>
      ),
      width: "300px",
    },
  ];
};


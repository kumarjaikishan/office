import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { Tooltip } from '@mui/material';
import { isSameDay } from 'date-fns';

const renderHighlightedDay = (date, selectedDates, pickersDayProps) => {
  const holiday = holidays.find(h => isSameDay(new Date(h.fromDate), date));

  if (holiday) {
    return (
      <Tooltip title={holiday.name}>
        <PickersDay
          {...pickersDayProps}
          sx={{ backgroundColor: '#a5d6a7', color: '#000', '&:hover': { backgroundColor: '#81c784' } }}
        />
      </Tooltip>
    );
  }

  return <PickersDay {...pickersDayProps} />;
};

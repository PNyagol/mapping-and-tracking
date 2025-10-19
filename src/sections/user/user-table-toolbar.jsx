import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Iconify } from 'src/components/iconify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


// ----------------------------------------------------------------------

export function UserTableToolbar(props) {
  const { numSelected, filterName, onFilterName } = props;
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
            <OutlinedInput
              fullWidth
              value={filterName}
              onChange={onFilterName}
              placeholder="Search user..."
              startAdornment={
                <InputAdornment position="start">
                  <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              }
              sx={{ maxWidth: 320 }}
            />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      ) : (
        <Grid container justifyContent='space-between' alignItems='center' spacing={2}>
          <Grid item size={10}>
            <Grid container spacing={3}>
              <Grid size={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="From Date" format='YYYY-MM-DD' value={dayjs(props.startDate)} onChange={props.handleStartDateChange} />
                </LocalizationProvider>
              </Grid>
              <Grid size={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="To Date" format='YYYY-MM-DD' value={dayjs(props.endDate)} onChange={props.handleEndDateChange} />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
          <Grid item size={2}>
          <Tooltip title="Filter list">
            <IconButton>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
          </Grid>
        </Grid>
      )}
    </Toolbar>
  );
}

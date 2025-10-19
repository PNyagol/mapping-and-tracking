import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import moment from 'moment/moment';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function UserTableRow({ row, selected, onSelectRow, setOpen, setSelectedVehicle, handleOpenNotes }) {
  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = useCallback((event) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const getColor = (role) => {
    switch (role) {
      case 'admin':
        return 'success';
      case 'clerk':
        return 'warning';
      default:
        return 'info';
    }
  };

  const stringToColor = (string) => {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  };

  const stringAvatar = () => {
    const name = row?.vehicle_type;
    if (name) {
      return {
        sx: {
          bgcolor: stringToColor(name),
        },
        children: `${name.split('')[0]}`,
      };
    } else {
      return {};
    }
  };

  const handleEditUser = () => {
    setOpen(true);
    setSelectedVehicle(row);
    handleClosePopover();
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar alt={row.vehicle_type} {...stringAvatar()} />
            {row.vehicle_type}
          </Box>
        </TableCell>

        <TableCell>{row.transmission_type}</TableCell>

        <TableCell>{row.number_of_passengers}</TableCell>
        <TableCell>{row.reg_number}</TableCell>

        <TableCell align="center">
          {row.is_active ? (
            <Iconify width={22} icon="lets-icons:check-fill" sx={{ color: 'success.main' }} />
          ) : (
            <Iconify width={22} icon="icon-park-solid:close-one" sx={{ color: 'error.main' }} />
          )}
        </TableCell>

        <TableCell>
          { moment(row?.last_service_date).format("YYYY-MM-DD") }
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEditUser}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem onClick={() => { handleOpenNotes(row); handleClosePopover() }} disabled={!row?.notes}>
            <Iconify icon="ic:baseline-remove-red-eye" />
            View Note
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useSelector, useDispatch } from 'react-redux';
import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { getAllUsers } from '../../../redux/actionCreators/authActions';
import moment from 'moment';
import { EditUsersModal } from '../modal/edit_users_modal';
import { gql, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
// ----------------------------------------------------------------------

export function PinnedLocationDetails() {
  const table = useTable();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(50);
  const [startDate, setStartDate] = useState(dayjs().subtract(2, 'months'));
  const [endDate, setEndDate] = useState(dayjs());
  const dispatch = useDispatch();
  const [filterName, setFilterName] = useState('');
  const [openEdit, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [data, setData] = useState([]);

  // Format dates only when sending to API or query
  const formattedStart = startDate.format('YYYY/MM/DD');
  const formattedEnd = endDate.format('YYYY/MM/DD');

  const { data: locationResults, refetch } = useQuery(GET_USER_ALL_GEOLOCATION, {
    variables: { startDate: formattedStart, endDate: formattedEnd },
  });

  useEffect(() => {
    setData(locationResults?.allUserLocations || []);
  }, [locationResults]);

  const onChangePage = (value) => {
    setPage(value);
  };

  const onChangeRowsPerPage = (_, data) => {
    setPerPage(data.props.value);
  };

  // Fetch users when pagination or date filters change
  useEffect(() => {
    dispatch(getAllUsers(page, perPage, formattedStart, formattedEnd));
  }, [dispatch, page, perPage, formattedStart, formattedEnd]);

  const dataFiltered = applyFilter({
    inputData: data,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  // Date change handlers (from MUI DatePicker)
  const handleStartDateChange = (date) => {
    console.log('***************************************START DATE');
    console.log(date?.toString());
    console.log(date?.format('YYYY/MM/DD'));
    console.log('***************************************START DATE');
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  useEffect(() => {
    document.title = 'My Locations - Mazingira Concept';
  }, []);

  useEffect(() => {
    refetch();
  }, [formattedStart, formattedEnd, refetch])

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          My Pinned Location
        </Typography>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
          startDate={startDate}
          endDate={endDate}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={_users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    _users.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'country', label: 'Country' },
                  { id: 'county', label: 'County' },
                  { id: 'ward', label: 'Ward' },
                  { id: 'latitude', label: 'Latitude' },
                  { id: 'longitude', label: 'Longitude' },
                  { id: 'isAssigned', label: 'Is Assigned' },
                  { id: 'isCollected', label: 'Is Collected' },
                  { id: 'dateAdded', label: 'Date Reported' }
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      setOpen={setOpen}
                      setSelectedUser={setSelectedUser}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, _users.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={data.length}
          rowsPerPage={perPage}
          onPageChange={(_, page) => onChangePage(page)}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          onRowsPerPageChange={onChangeRowsPerPage}
        />
      </Card>
      <EditUsersModal open={openEdit} setOpen={setOpen} user={selectedUser} />
    </DashboardContent>
  );
}

const GET_USER_ALL_GEOLOCATION = gql`
  query allUserLocations($startDate: String, $endDate: String) {
    allUserLocations(startDate: $startDate, endDate: $endDate) {
      id
      user {
        firstName
        lastName
      }
      county
      country
      subCounty
      ward
      latitude
      longitude
      imageUrl
      description
      isAssigned
      isCollected
      dateAdded
      projectSet {
        id
        projectName {
          county
          subCounty
          ward
        }
        projectTimelineFrom
      }
      assignwasteSet {
        id
        user {
          DriverName
        }
      }
    }
  }
`;

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');

  const onSort = useCallback(
    (id) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked, newSelecteds) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}

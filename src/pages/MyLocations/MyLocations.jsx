import React, { useEffect } from 'react'
import Dashboard from '../../components/Dashboard/Dashboard'
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Container,
  Badge, Stack, Chip,
  Card
} from '@mui/material';
import { gql, useQuery } from '@apollo/client';
import moment from 'moment';

export const MyLocations = () => {
    const today = new Date();
    const currentDate = today.toISOString().slice(0, 10).replaceAll("-", "/");

    useEffect(() => {
      document.title = "My Locations - Mazingira Concept";
    }, []);
  
    const twoMonthsFromNowUnFromated = new Date(
      today.getFullYear(),
      today.getMonth() - 3,
      today.getDate()
    );
    const twoMonthsFromNow = twoMonthsFromNowUnFromated
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "/");
  
    const startDate = twoMonthsFromNow;
    const endDate = currentDate;
    const { data, refetch } = useQuery(GET_USER_ALL_GEOLOCATION, {
      variables: { startDate, endDate },
    });

  return (
    <Dashboard>
      <Container maxWidth={false} disableGutters>
        <Card className='card' style={{ marginLeft: '20px', marginRight: '20px', marginTop: '50px', marginBottom: '50px' }}>
            <TableContainer component={Paper} style={{ boxShadow: 'none', margin: "50px" }}>
              <Table aria-label="simple table" style={{ boxShadow: 'none' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>county</TableCell>
                    <TableCell>country</TableCell>
                    <TableCell>subCounty</TableCell>
                    <TableCell>ward</TableCell>
                    <TableCell>latitude</TableCell>
                    <TableCell>longitude</TableCell>
                    <TableCell>isAssigned</TableCell>
                    <TableCell>isCollected</TableCell>
                    <TableCell>dateAdded</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.allUserLocations?.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{ row.county }</TableCell>
                      <TableCell>{ row.country }</TableCell>
                      <TableCell>{ row.subCounty }</TableCell>
                      <TableCell>{ row.ward }</TableCell>
                      <TableCell>{ row.latitude }</TableCell>
                      <TableCell>{ row.longitude }</TableCell>
                      <TableCell>
                        { row.isAssigned ? <Chip label="Assigned" color="success" variant="outlined" /> : <Chip label="Not Assigned" color="error" variant="outlined" /> }
                      </TableCell>
                      <TableCell>
                        { row.isCollected ? <Chip label="Collected" color="success" variant="outlined" /> : <Chip label="Not Collected" color="error" variant="outlined" /> }
                      </TableCell>
                      <TableCell>{ moment(row.dateAdded).format("DD/MM/YYYY") }</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </Card>
      </Container>
    </Dashboard>
  )
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
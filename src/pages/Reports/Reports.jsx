import React, { useEffect, useState } from "react";
import Dashboard from "../../components/Dashboard/Dashboard";
import { Card, CardContent, Typography, Container } from "@mui/material";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { gql, useQuery } from "@apollo/client";

export const Reports = () => {

  const { data } = useQuery(GET_USER_REPORT);
  const [collection, setCollection] = useState([])
  const [completed, setCompleted] = useState([])
  const [inProgress, setInProgress] = useState([])
  const [scheduled, setScheduled] = useState([])

    useEffect(() => {
      document.title = "My Reports - Mazingira Concept";
    }, []);

  useEffect(() => {
    if(data?.getUserDataReport){
      const res = data?.getUserDataReport
      setCollection(res?.reported || [])
      setCompleted(res?.completed || [])
      setInProgress(res?.inProgress || [])
      setScheduled(res?.assigned || [])
    }
  }, [data])


  const reportData = [
    { title: "Reported Litter", data: collection },
    { title: "Scheduled for clean up", data: scheduled },
    { title: "In Progress", data: inProgress },
    { title: "Completed cleanups", data: completed },
  ];

  return (
    <>
      <Dashboard>
        <Container style={{ paddingTop: "50px", paddingBottom: "50px" }}>
          {reportData.map((map, index) => (
            <Card
              className="card reports_main_card"
              style={{ marginBottom: "30px" }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <b>{map.title}</b>
                </Typography>
                <Typography variant="body2">
                  <Typography variant="h5">
                    <b>Total: {map.data.reduce((acc, rep) => acc + rep.total, 0)}</b>
                  </Typography>
                  <Typography
                    style={{ color: "hsl(220, 20%, 35%)", fontSize: "12px" }}
                  >
                    In the last 30 days
                  </Typography>
                </Typography>

                <div style={{ minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={map.data}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "none",
                          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                        }}
                        cursor={{
                          stroke: "rgba(82, 188, 82, 0.3)",
                          strokeWidth: 2,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="rgb(82, 188, 82)"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </Container>
      </Dashboard>
    </>
  );
};


const GET_USER_REPORT = gql`
  query getUserDataReport {
    getUserDataReport {
      reported {
        month
        total
      }
      assigned {
        month
        total
      }
      inProgress {
        month
        total
      }
      completed {
        month
        total
      }
    }
  }
`
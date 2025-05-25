import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Reports } from './pages/Reports/Reports';
import { Profile } from './pages/Profile/Profile';
import { MyLocations } from './pages/MyLocations/MyLocations';
import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Authentication } from './pages/Authentication/Authentication';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
// import { createUploadLink } from 'apollo-upload-client';


const theme = createTheme({
  palette: {
    primary: {
      main: '#052228', // custom green
    },
    secondary: {
      main: '#00A599', // orange
    },
    error: {
      main: '#f44336', // red
    },
    background: {
      default: '#f4f4f4',
    },
  },
});


const httpLink = createHttpLink({
  uri: "http://127.0.0.1:8000/graphql/",
  // uri: "https://app.mazingiraconcept.com/graphql/",
});


const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("_authToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <ApolloProvider client={client}>
          <Router>
            <Routes>
              <Route path="/dashboard" element={ <Home /> } />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />}/>
              <Route path="/my_locations" element={<MyLocations />} />
              <Route path="/authentication" element={<Authentication />}/>
              <Route path="" exact element={<Home />} />
            </Routes>
          </Router>
        </ApolloProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;

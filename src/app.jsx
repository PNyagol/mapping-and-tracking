import 'src/global.css';
import React, { useEffect } from 'react';
import { usePathname } from './routes/hooks';
import { ThemeProvider } from 'src/theme/theme-provider';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import store from './redux/store';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// ----------------------------------------------------------------------

export default function App({ children }) {
  useScrollToTop();

  const httpLink = createHttpLink({
    // uri: "http://127.0.0.1:8000/graphql/",
    uri: "https://app.mazingiraconcept.com/graphql/",
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

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <SnackbarProvider>
          <ThemeProvider maxSnack={3} autoHideDuration={3000} position="top-right">
            {children}
          </ThemeProvider>
        </SnackbarProvider>
      </Provider>
    </ApolloProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

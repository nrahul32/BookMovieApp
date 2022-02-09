import React from "react";
import Home from "../screens/home/Home";
import Details from "../screens/details/Details";
import { BrowserRouter as Router, Route } from "react-router-dom";
import BookShow from "../screens/bookshow/BookShow";
import Confirmation from "../screens/confirmation/Confirmation";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";

const Controller = () => {
  const baseUrl = "/api/v1/";
  const theme = createTheme({
    palette: {
      primary: {
        main: '#0971f1',
        darker: '#053e85',
      },
      default: {
        main: '#e0e0e0',
        contrastText: '#000000',
      },
    }
  });

  return (
    <Router>
      <div className="main-container">
      <ThemeProvider theme={theme}>
        <Route
            exact
            path="/"
            render={(props) => <Home {...props} baseUrl={baseUrl} theme={theme} />}
          />
          <Route
            path="/movie/:id"
            render={(props) => <Details {...props} baseUrl={baseUrl} theme={theme} />}
          />
          <Route
            path="/bookshow/:id"
            render={(props) => <BookShow {...props} baseUrl={baseUrl} theme={theme} />}
          />
          <Route
            path="/confirm/:id"
            render={(props) => <Confirmation {...props} baseUrl={baseUrl} theme={theme} />}
          />
      </ThemeProvider>
      </div>
    </Router>
  );
};

export default Controller;

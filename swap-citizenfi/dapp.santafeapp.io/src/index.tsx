import React, { Suspense } from "react";

import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import Loading from "./components/loading"
// import store from './redux/store';
import { store } from './app/store'
import { Provider } from 'react-redux'

// const LazyComponent = React.lazy(() => import("./App"))
ReactDOM.render(
  
  <BrowserRouter>
    {/* <Suspense fallback={null}> */}
      {/* <Suspense fallback={<div><h3 style={{color:'#fff',backgroundColor:'#000'}}>Loading...</h3></div>}> */}
      <Suspense fallback={<Loading />}>
        <Provider store={store}>
          <App />
        </Provider>
      </Suspense>
      {/* <Loading /> */}
    {/* </Suspense> */}
  </BrowserRouter>,
  document.getElementById("root")
);

serviceWorker.unregister();
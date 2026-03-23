import { createStore, combineReducers, applyMiddleware } from "redux";


import { rootReducer } from "./rootReducer";
import apiReducer from "./apiSlice";

const finalReducer = combineReducers({
  rootReducer,
  api: apiReducer,
});

const intialState = {
  rootReducer: {
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
  },
};

const store = createStore(
  finalReducer,
  intialState,
);

export default store;

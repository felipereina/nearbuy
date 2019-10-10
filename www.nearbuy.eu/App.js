import React, { Component } from 'react';
import SwitchNavigator from './navigation/SwitchNavigator'
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'
import reducer from './reducers/index.js'
import thunkMiddleWare from 'redux-thunk'
const middleWare = applyMiddleware(thunkMiddleWare)
const store = createStore(reducer, middleWare)
console.disableYellowBox = true

store.subscribe(() => {
  console.log("[Subscription]", store.getState())

})

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <SwitchNavigator/>
      </Provider>

    );
  }
}
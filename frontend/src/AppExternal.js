/*import React, { Component, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Subscribe from './components/Subscribe'
import './scss/style.scss'*/

'use strict';

const e = React.createElement;


class AppExternal extends React.Component {
  render() {
    return (
      <p>ok ok</p>
    )
  }
}

const domContainer = document.querySelector('#like_button_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(AppExternal));
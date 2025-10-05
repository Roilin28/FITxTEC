import React from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from '../src/screens/Login';
import Tabs from '../src/Navigation/Tabs';


export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <LoginScreen />
      <Tabs />

    </>
  );
}


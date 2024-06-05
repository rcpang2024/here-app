import { MainContainer } from './navigation/MainContainer';
import * as React from 'react';
import { UserProvider } from './user-context';

export default function App() {
  return (
    <UserProvider>
      <MainContainer/>
    </UserProvider>
  );
}

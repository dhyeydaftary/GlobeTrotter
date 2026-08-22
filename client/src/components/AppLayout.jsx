import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Navbar />
      <Outlet />
    </div>
  );
}

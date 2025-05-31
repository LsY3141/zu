import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';
import CalendarSidebar from './CalendarSidebar';
import { useSelector } from 'react-redux';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #F5F7F9;
`;

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentContainer = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Layout = () => {
  const { sidebarOpen, calendarOpen } = useSelector(state => state.ui);
  
  return (
    <LayoutContainer>
      {sidebarOpen && <Sidebar />}
      <MainContainer>
        <Header />
        <ContentContainer>
          <Outlet />
        </ContentContainer>
      </MainContainer>
      {calendarOpen && <CalendarSidebar />}
    </LayoutContainer>
  );
};

export default Layout;
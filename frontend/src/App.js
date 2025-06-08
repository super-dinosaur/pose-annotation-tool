/**
 * Main application component - refactored and simplified
 */

import React from "react";
import { Layout } from "antd";
import { AppProvider } from "./store";
import { AnnotationWorkspace } from "./components/AnnotationWorkspace";
import { VideoProcessor } from "./features/video";
import "./App.css";

const { Content } = Layout;

/**
 * Main App component
 * @returns {JSX.Element}
 */
function App() {
  return (
    <AppProvider>
      <Layout className="app-layout">
        <Content className="app-content">
          <VideoProcessor />
          <AnnotationWorkspace />
        </Content>
      </Layout>
    </AppProvider>
  );
}

export default App;

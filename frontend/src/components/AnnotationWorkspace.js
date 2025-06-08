/**
 * Main annotation workspace component
 * This replaces the monolithic VideoAnnotator component
 */

import React from "react";
import { Layout } from "antd";
import { AppHeader } from "./common/AppHeader";
import { AppSidebar } from "./common/AppSidebar";
import { AppFooter } from "./common/AppFooter";
import { AnnotationCanvas } from "../features/annotation/components/AnnotationCanvas";
import { LoadingOverlay } from "./common/LoadingOverlay";
import { AddPersonModal } from "../features/person/components/AddPersonModal";
import { DebugInfo } from "./common/DebugInfo";
import { useAppContext } from "../store";
import "./AnnotationWorkspace.css";

const { Header, Sider, Content, Footer } = Layout;

/**
 * AnnotationWorkspace component
 * @returns {JSX.Element}
 */
export const AnnotationWorkspace = () => {
  const { state } = useAppContext();
  const { video, ui } = state;

  return (
    <Layout className="annotation-workspace">
      <Header className="workspace-header">
        <AppHeader />
      </Header>

      <Layout className="workspace-main">
        <Sider
          width={280}
          className="workspace-sidebar"
          theme="light"
          collapsible={false}
        >
          <AppSidebar />
        </Sider>

        <Content className="workspace-content">
          <AnnotationCanvas />
          debugger;
          {video.isLoading && <LoadingOverlay />}
        </Content>
      </Layout>

      <Footer className="workspace-footer">
        <AppFooter />
      </Footer>

      <AddPersonModal />
      {/* <DebugInfo /> */}
    </Layout>
  );
};

export default AnnotationWorkspace;

/**
 * Application sidebar with tabs
 */

import React, { useCallback } from 'react';
import { Tabs, Typography } from 'antd';
import { UserOutlined, AimOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { PersonList } from '../../features/person/components/PersonList';
import { KeypointList } from '../../features/keypoint/components/KeypointList';
import { VideoInfo } from '../../features/video/components/VideoInfo';
import { useAppContext } from '../../store';
import { TABS } from '../../constants';
import './AppSidebar.css';

const { TabPane } = Tabs;
const { Text } = Typography;

/**
 * AppSidebar component
 * @returns {JSX.Element}
 */
export const AppSidebar = () => {
  const { state, actions } = useAppContext();
  const { video, annotation, ui } = state;
  
  const handleTabChange = useCallback((activeKey) => {
    actions.setActiveTab(activeKey);
    
    // Auto-select first keypoint when switching to keypoints tab
    if (activeKey === TABS.KEYPOINTS && annotation.selectedPersonId) {
      // TODO: Get keypoints from constants and select first one
    }
  }, [actions, annotation.selectedPersonId]);
  
  const handlePersonSelect = useCallback((person) => {
    actions.selectPersonAndSwitchTab(person.id);
  }, [actions]);
  
  const handlePersonEdit = useCallback((personId, updates) => {
    actions.editPerson(personId, updates);
  }, [actions]);
  
  const handlePersonDelete = useCallback((personId) => {
    actions.deletePerson(personId);
  }, [actions]);
  
  const handleAddPerson = useCallback(() => {
    actions.setAddPersonModal(true);
  }, [actions]);
  
  const handleKeypointSelect = useCallback((keypoint) => {
    actions.setSelectedKeypoint(keypoint);
  }, [actions]);
  
  return (
    <div className="app-sidebar">
      <Tabs
        activeKey={ui.activeTab}
        onChange={handleTabChange}
        className="sidebar-tabs"
        size="small"
      >
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Persons
            </span>
          }
          key={TABS.PERSONS}
        >
          <PersonList
            persons={annotation.persons}
            selectedPersonId={annotation.selectedPersonId}
            onPersonSelect={handlePersonSelect}
            onPersonEdit={handlePersonEdit}
            onPersonDelete={handlePersonDelete}
            onAddPerson={handleAddPerson}
            annotations={annotation.annotations}
            currentFrame={video.currentFrame}
          />
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <AimOutlined />
              Keypoints
            </span>
          }
          key={TABS.KEYPOINTS}
        >
          <KeypointList
            selectedKeypoint={annotation.selectedKeypoint}
            onKeypointSelect={handleKeypointSelect}
            annotations={annotation.annotations}
            currentFrame={video.currentFrame}
            selectedPersonId={annotation.selectedPersonId}
          />
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <VideoCameraOutlined />
              Video Info
            </span>
          }
          key={TABS.VIDEO_INFO}
        >
          <VideoInfo
            videoName={video.name}
            videoInfo={video.info}
            totalFrames={video.totalFrames}
            currentFrame={video.currentFrame}
            annotations={annotation.annotations}
            persons={annotation.persons}
            simplified={true}
          />
        </TabPane>
      </Tabs>
      
      <div className="sidebar-shortcuts">
        <Text type="secondary" className="shortcuts-hint">
          <div><kbd>Tab</kbd> Switch tabs</div>
          <div><kbd>Ctrl+N</kbd> Add person</div>
          <div><kbd>←/→</kbd> Navigate frames</div>
        </Text>
      </div>
    </div>
  );
};

export default AppSidebar;

import React from 'react';
import { Button, List, Tooltip, Modal, Input, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PERSON_COLORS } from '../../constants/keypoints';
import './PersonManager.css';

const { confirm } = Modal;

/**
 * 人物管理组件
 * @param {Object} props - 组件属性
 * @param {Array} props.persons - 人物列表
 * @param {string} props.selectedPerson - 当前选中的人物ID
 * @param {Function} props.onPersonSelect - 人物选择回调
 * @param {Function} props.onAddPerson - 添加人物回调
 * @param {Function} props.onEditPerson - 编辑人物回调
 * @param {Function} props.onDeletePerson - 删除人物回调
 * @returns {JSX.Element} - 返回人物管理组件
 */
const PersonManager = ({
  persons,
  selectedPerson,
  onPersonSelect,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  annotations,
  currentFrame
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [currentPerson, setCurrentPerson] = React.useState(null);
  const [personName, setPersonName] = React.useState('');
  
  // 添加新人物
  const handleAddPerson = () => {
    setEditMode(false);
    setPersonName('');
    setCurrentPerson(null);
    setIsModalVisible(true);
  };
  
  // 编辑人物
  const handleEditPerson = (person) => {
    setEditMode(true);
    setPersonName(person.name);
    setCurrentPerson(person);
    setIsModalVisible(true);
  };
  
  // 删除人物
  const handleDeletePerson = (person) => {
    confirm({
      title: `确定要删除人物 "${person.name}" 吗？`,
      icon: <ExclamationCircleOutlined />,
      content: '删除后，该人物的所有标注数据将会丢失！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        onDeletePerson(person.id);
      }
    });
  };
  
  // 处理模态框确认
  const handleModalOk = () => {
    if (!personName.trim()) return;
    
    if (editMode) {
      onEditPerson(currentPerson.id, personName);
    } else {
      const colorIndex = persons.length % PERSON_COLORS.length;
      onAddPerson(personName, PERSON_COLORS[colorIndex]);
    }
    
    setIsModalVisible(false);
  };
  
  // 处理模态框取消
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  
  // 检查当前帧中人物是否已标注
  const isPersonAnnotatedInCurrentFrame = (personId) => {
    const frameKey = `frame_${currentFrame}`;
    if (!annotations[frameKey]) return false;
    return !!annotations[frameKey][personId];
  };

  // 获取人物在所有帧中的标注数量
  const getPersonAnnotationCount = (personId) => {
    let count = 0;
    Object.keys(annotations).forEach(frameKey => {
      if (annotations[frameKey][personId]) {
        count++;
      }
    });
    return count;
  };

  // 处理人物选择
  const handlePersonSelect = (person) => {
    // 选择人物后通知父组件
    onPersonSelect(person);
  };
  
  return (
    <div className="person-manager">
      <div className="person-manager-header">
        <h3>人物列表</h3>
        <Button 
          type="primary" 
          size="small" 
          icon={<PlusOutlined />} 
          onClick={handleAddPerson}
        >
          添加人物
        </Button>
      </div>
      
      {persons.length === 0 ? (
        <div className="no-person-tip">
          请添加人物开始标注
        </div>
      ) : (
        <List
          size="small"
          className="person-list"
          dataSource={
            // 过滤掉重复的人物ID，确保每个ID只出现一次
            persons.filter((person, index, self) => 
              index === self.findIndex(p => p.id === person.id)
            )
          }
          renderItem={person => (
            <List.Item 
              className={`person-item ${selectedPerson === person.id ? 'selected-person' : ''}`}
              onClick={() => handlePersonSelect(person)}
              actions={[
                <Tooltip title="编辑">
                  <EditOutlined 
                    className="action-icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPerson(person);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="删除">
                  <DeleteOutlined 
                    className="action-icon delete" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePerson(person);
                    }}
                  />
                </Tooltip>
              ]}
            >
              <div className="person-color" style={{ backgroundColor: person.color }}></div>
              <Tooltip title={`ID: ${person.id} - ${person.name}`}>
                <div className="person-name">{person.name}</div>
              </Tooltip>
              {isPersonAnnotatedInCurrentFrame(person.id) && (
                <Tag color="success" size="small">当前帧</Tag>
              )}
            </List.Item>
          )}
        />
      )}
      
      <Modal
        title={editMode ? "编辑人物" : "添加人物"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editMode ? "保存" : "添加"}
        cancelText="取消"
        className="modern-modal"
        destroyOnClose
      >
        <div className="modal-hint">按Enter键快速{editMode ? "保存" : "创建"}</div>
        <Input
          placeholder="请输入人物名称"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          onPressEnter={handleModalOk}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default PersonManager; 
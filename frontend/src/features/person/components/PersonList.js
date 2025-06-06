/**
 * Person list component
 */

import React, { useState, useCallback } from 'react';
import { List, Button, Avatar, Popconfirm, Input, message, Badge, Tooltip } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined, 
  CloseOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import { validatePersonName, isPersonNameUnique, getPersonStats } from '../services/personService';
import { hasPersonAnnotations } from '../../../utils/annotation';
import './PersonList.css';

/**
 * PersonList component
 * @param {Object} props - Component props
 * @param {import('../../../types').Person[]} props.persons - List of persons
 * @param {string|null} props.selectedPersonId - Selected person ID
 * @param {Function} props.onPersonSelect - Callback when person is selected
 * @param {Function} props.onPersonEdit - Callback when person is edited
 * @param {Function} props.onPersonDelete - Callback when person is deleted
 * @param {Function} props.onAddPerson - Callback to add new person
 * @param {import('../../../types').Annotations} props.annotations - Annotations data
 * @param {number} props.currentFrame - Current frame index
 * @returns {JSX.Element}
 */
export const PersonList = ({
  persons = [],
  selectedPersonId,
  onPersonSelect,
  onPersonEdit,
  onPersonDelete,
  onAddPerson,
  annotations = {},
  currentFrame = 0,
}) => {
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [editingName, setEditingName] = useState('');
  
  const handlePersonClick = useCallback((person) => {
    if (editingPersonId) return; // Don't select when editing
    onPersonSelect?.(person);
  }, [editingPersonId, onPersonSelect]);
  
  const handleEditStart = useCallback((person, e) => {
    e.stopPropagation();
    setEditingPersonId(person.id);
    setEditingName(person.name);
  }, []);
  
  const handleEditSave = useCallback((personId, e) => {
    e.stopPropagation();
    
    const validation = validatePersonName(editingName);
    if (!validation.isValid) {
      message.error(validation.error);
      return;
    }
    
    if (!isPersonNameUnique(editingName, persons, personId)) {
      message.error('Person name already exists');
      return;
    }
    
    onPersonEdit?.(personId, { name: editingName.trim() });
    setEditingPersonId(null);
    setEditingName('');
    message.success('Person name updated');
  }, [editingName, persons, onPersonEdit]);
  
  const handleEditCancel = useCallback((e) => {
    e.stopPropagation();
    setEditingPersonId(null);
    setEditingName('');
  }, []);
  
  const handleDelete = useCallback((personId, e) => {
    e.stopPropagation();
    onPersonDelete?.(personId);
  }, [onPersonDelete]);
  
  const handleAddPerson = useCallback(() => {
    onAddPerson?.();
  }, [onAddPerson]);
  
  const renderPersonItem = useCallback((person) => {
    const isSelected = selectedPersonId === person.id;
    const isEditing = editingPersonId === person.id;
    const hasCurrentFrameAnnotations = hasPersonAnnotations(annotations, person.id, currentFrame);
    const stats = getPersonStats(person, annotations);
    
    const actions = [];
    
    if (isEditing) {
      actions.push(
        <Button
          key="save"
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={(e) => handleEditSave(person.id, e)}
          className="action-button save"
        />
      );
      actions.push(
        <Button
          key="cancel"
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleEditCancel}
          className="action-button cancel"
        />
      );
    } else {
      actions.push(
        <Button
          key="edit"
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => handleEditStart(person, e)}
          className="action-button edit"
        />
      );
      actions.push(
        <Popconfirm
          key="delete"
          title="Delete Person"
          description="Are you sure you want to delete this person and all their annotations?"
          onConfirm={(e) => handleDelete(person.id, e)}
          onCancel={(e) => e.stopPropagation()}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => e.stopPropagation()}
            className="action-button delete"
            danger
          />
        </Popconfirm>
      );
    }
    
    return (
      <List.Item
        key={person.id}
        className={`person-item ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
        onClick={() => handlePersonClick(person)}
        actions={actions}
      >
        <List.Item.Meta
          avatar={
            <Badge 
              dot={hasCurrentFrameAnnotations} 
              offset={[-8, 8]}
              color={person.color}
            >
              <Avatar 
                icon={<UserOutlined />}
                style={{ backgroundColor: person.color }}
                size="small"
              />
            </Badge>
          }
          title={
            isEditing ? (
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onPressEnter={(e) => handleEditSave(person.id, e)}
                onBlur={(e) => handleEditSave(person.id, e)}
                size="small"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Tooltip title={`${stats.totalFrames} frames, ${stats.totalKeypoints} keypoints`}>
                <span className="person-name" style={{ color: isSelected ? person.color : undefined }}>
                  {person.name}
                </span>
              </Tooltip>
            )
          }
          description={
            !isEditing && (
              <div className="person-stats">
                <span className="stat-item">{stats.totalFrames} frames</span>
                <span className="stat-item">{stats.totalKeypoints} points</span>
              </div>
            )
          }
        />
      </List.Item>
    );
  }, [
    selectedPersonId,
    editingPersonId,
    editingName,
    annotations,
    currentFrame,
    persons,
    handlePersonClick,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleDelete,
  ]);
  
  return (
    <div className="person-list">
      <div className="person-list-header">
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddPerson}
          block
          size="small"
        >
          Add Person
        </Button>
      </div>
      
      <List
        dataSource={persons}
        renderItem={renderPersonItem}
        size="small"
        className="persons"
        locale={{
          emptyText: 'No persons added yet'
        }}
      />
    </div>
  );
};

export default PersonList;

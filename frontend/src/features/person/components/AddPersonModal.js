/**
 * Add person modal component
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Modal, Input, message } from 'antd';
import { useAppContext } from '../../../store';
import { validatePersonName, isPersonNameUnique } from '../services/personService';

/**
 * AddPersonModal component
 * @returns {JSX.Element}
 */
export const AddPersonModal = () => {
  const { state, actions } = useAppContext();
  const { ui, annotation } = state;
  const inputRef = useRef(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (ui.isAddPersonModalVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [ui.isAddPersonModalVisible]);
  
  const handleOk = useCallback(() => {
    const name = ui.newPersonName.trim();
    
    if (!name) {
      message.error('Please enter a person name');
      return;
    }
    
    const validation = validatePersonName(name);
    if (!validation.isValid) {
      message.error(validation.error);
      return;
    }
    
    if (!isPersonNameUnique(name, annotation.persons)) {
      message.error('Person name already exists');
      return;
    }
    
    const newPerson = actions.createPerson(name);
    actions.setAddPersonModal(false);
    actions.setNewPersonName('');
    actions.selectPersonAndSwitchTab(newPerson.id);
    
    message.success(`Person "${newPerson.name}" added successfully`);
  }, [ui.newPersonName, annotation.persons, actions]);
  
  const handleCancel = useCallback(() => {
    actions.setAddPersonModal(false);
    actions.setNewPersonName('');
  }, [actions]);
  
  const handleNameChange = useCallback((e) => {
    actions.setNewPersonName(e.target.value);
  }, [actions]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleOk();
    }
  }, [handleOk]);
  
  return (
    <Modal
      title="Add New Person"
      open={ui.isAddPersonModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Add Person"
      cancelText="Cancel"
      className="add-person-modal"
      destroyOnClose
      width={400}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, color: '#8c8c8c', fontSize: 12 }}>
          Press Enter to quickly create
        </div>
        <Input
          ref={inputRef}
          placeholder="Enter person name"
          value={ui.newPersonName}
          onChange={handleNameChange}
          onKeyDown={handleKeyDown}
          maxLength={50}
          showCount
        />
      </div>
    </Modal>
  );
};

export default AddPersonModal;

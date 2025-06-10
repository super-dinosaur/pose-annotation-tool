/**
 * Application state management using React Context
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { PERSON_COLORS, KEYPOINTS, TABS } from '../constants';
import { generatePersonId, generateUniqueName } from '../utils/annotation';

/**
 * Initial state
 */
const initialState = {
  // Video state
  video: {
    src: null,
    name: '',
    info: { width: 0, height: 0, duration: 0, frameRate: 30 },
    currentFrame: 0,
    totalFrames: 0,
    frameImage: null,
    isLoading: false,
    scale: 1,
    cropBounds: null, // { x, y, width, height } for cropping black borders
  },
  
  // Annotation state
  annotation: {
    annotations: {},
    persons: [],
    selectedPersonId: null,
    selectedKeypoint: null,
    nextPersonId: 1,
  },
  
  // UI state
  ui: {
    activeTab: TABS.PERSONS,
    isAddPersonModalVisible: false,
    newPersonName: '',
    isInferencing: false,
  },
};

/**
 * Action types
 */
const ActionTypes = {
  // Video actions
  SET_VIDEO_SRC: 'SET_VIDEO_SRC',
  SET_VIDEO_INFO: 'SET_VIDEO_INFO',
  SET_CURRENT_FRAME: 'SET_CURRENT_FRAME',
  SET_FRAME_IMAGE: 'SET_FRAME_IMAGE',
  SET_VIDEO_LOADING: 'SET_VIDEO_LOADING',
  SET_VIDEO_SCALE: 'SET_VIDEO_SCALE',
  SET_CROP_BOUNDS: 'SET_CROP_BOUNDS',
  
  // Annotation actions
  ADD_ANNOTATION: 'ADD_ANNOTATION',
  SET_ANNOTATIONS: 'SET_ANNOTATIONS',
  ADD_PERSON: 'ADD_PERSON',
  EDIT_PERSON: 'EDIT_PERSON',
  DELETE_PERSON: 'DELETE_PERSON',
  SET_SELECTED_PERSON: 'SET_SELECTED_PERSON',
  SET_SELECTED_KEYPOINT: 'SET_SELECTED_KEYPOINT',
  
  // UI actions
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_ADD_PERSON_MODAL: 'SET_ADD_PERSON_MODAL',
  SET_NEW_PERSON_NAME: 'SET_NEW_PERSON_NAME',
  SET_INFERENCING: 'SET_INFERENCING',
  
  // Reset
  RESET_STATE: 'RESET_STATE',
  RESET_ANNOTATIONS: 'RESET_ANNOTATIONS',
};

/**
 * Reducer function
 */
const appReducer = (state, action) => {
  switch (action.type) {
    // Video actions
    case ActionTypes.SET_VIDEO_SRC:
      console.log('[Reducer] SET_VIDEO_SRC:', action.payload);
      const newState = {
        ...state,
        video: {
          ...state.video,
          src: action.payload.src,
          name: action.payload.name,
        },
      };
      return newState;
      
    case ActionTypes.SET_VIDEO_INFO:
      return {
        ...state,
        video: {
          ...state.video,
          info: action.payload.info,
          totalFrames: action.payload.totalFrames,
        },
      };
      
    case ActionTypes.SET_CURRENT_FRAME:
      return {
        ...state,
        video: {
          ...state.video,
          currentFrame: action.payload,
        },
      };
      
    case ActionTypes.SET_FRAME_IMAGE:
      return {
        ...state,
        video: {
          ...state.video,
          frameImage: action.payload,
        },
      };
      
    case ActionTypes.SET_VIDEO_LOADING:
      return {
        ...state,
        video: {
          ...state.video,
          isLoading: action.payload,
        },
      };
      
    case ActionTypes.SET_VIDEO_SCALE:
      return {
        ...state,
        video: {
          ...state.video,
          scale: action.payload,
        },
      };
      
    case ActionTypes.SET_CROP_BOUNDS:
      return {
        ...state,
        video: {
          ...state.video,
          cropBounds: action.payload,
        },
      };
      
    // Annotation actions
    case ActionTypes.ADD_ANNOTATION:
      const { frameIndex, personId, keypointId, position } = action.payload;
      const frameKey = `frame_${frameIndex}`;
      
      return {
        ...state,
        annotation: {
          ...state.annotation,
          annotations: {
            ...state.annotation.annotations,
            [frameKey]: {
              ...state.annotation.annotations[frameKey],
              [personId]: {
                ...state.annotation.annotations[frameKey]?.[personId],
                [keypointId]: position,
              },
            },
          },
        },
      };
      
    case ActionTypes.SET_ANNOTATIONS:
      return {
        ...state,
        annotation: {
          ...state.annotation,
          annotations: action.payload,
        },
      };
      
    case ActionTypes.ADD_PERSON:
      const newPerson = action.payload;
      return {
        ...state,
        annotation: {
          ...state.annotation,
          persons: [...state.annotation.persons, newPerson],
          nextPersonId: parseInt(newPerson.id) + 1,
        },
      };
      
    case ActionTypes.EDIT_PERSON:
      return {
        ...state,
        annotation: {
          ...state.annotation,
          persons: state.annotation.persons.map(person =>
            person.id === action.payload.id
              ? { ...person, ...action.payload.updates }
              : person
          ),
        },
      };
      
    case ActionTypes.DELETE_PERSON:
      const deletedPersonId = action.payload;
      
      // Remove person from list
      const updatedPersons = state.annotation.persons.filter(
        person => person.id !== deletedPersonId
      );
      
      // Remove person's annotations
      const updatedAnnotations = {};
      Object.entries(state.annotation.annotations).forEach(([frameKey, frameData]) => {
        const { [deletedPersonId]: deleted, ...restPersons } = frameData;
        if (Object.keys(restPersons).length > 0) {
          updatedAnnotations[frameKey] = restPersons;
        }
      });
      
      return {
        ...state,
        annotation: {
          ...state.annotation,
          persons: updatedPersons,
          annotations: updatedAnnotations,
          selectedPersonId: state.annotation.selectedPersonId === deletedPersonId 
            ? null 
            : state.annotation.selectedPersonId,
        },
      };
      
    case ActionTypes.SET_SELECTED_PERSON:
      return {
        ...state,
        annotation: {
          ...state.annotation,
          selectedPersonId: action.payload,
        },
      };
      
    case ActionTypes.SET_SELECTED_KEYPOINT:
      return {
        ...state,
        annotation: {
          ...state.annotation,
          selectedKeypoint: action.payload,
        },
      };
      
    // UI actions
    case ActionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeTab: action.payload,
        },
      };
      
    case ActionTypes.SET_ADD_PERSON_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          isAddPersonModalVisible: action.payload,
        },
      };
      
    case ActionTypes.SET_NEW_PERSON_NAME:
      return {
        ...state,
        ui: {
          ...state.ui,
          newPersonName: action.payload,
        },
      };
      
    case ActionTypes.SET_INFERENCING:
      return {
        ...state,
        ui: {
          ...state.ui,
          isInferencing: action.payload,
        },
      };
      
    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        ui: state.ui, // Preserve UI state
      };
      
    case ActionTypes.RESET_ANNOTATIONS:
      return {
        ...state,
        annotation: {
          annotations: {},
          persons: [],
          selectedPersonId: null,
          selectedKeypoint: null,
          nextPersonId: 1,
        },
      };
      
    default:
      return state;
  }
};

/**
 * Context
 */
const AppContext = createContext();

/**
 * Provider component
 */
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Action creators
  const actions = {
    // Video actions
    setVideoSrc: useCallback((src, name) => {
      console.log('[AppContext] setVideoSrc called:', { src, name });
      dispatch({ type: ActionTypes.SET_VIDEO_SRC, payload: { src, name } });
    }, []),
    
    setVideoInfo: useCallback((info, totalFrames) => {
      dispatch({ type: ActionTypes.SET_VIDEO_INFO, payload: { info, totalFrames } });
    }, []),
    
    setCurrentFrame: useCallback((frame) => {
      dispatch({ type: ActionTypes.SET_CURRENT_FRAME, payload: frame });
    }, []),
    
    setFrameImage: useCallback((image) => {
      dispatch({ type: ActionTypes.SET_FRAME_IMAGE, payload: image });
    }, []),
    
    setVideoLoading: useCallback((loading) => {
      dispatch({ type: ActionTypes.SET_VIDEO_LOADING, payload: loading });
    }, []),
    
    setVideoScale: useCallback((scale) => {
      dispatch({ type: ActionTypes.SET_VIDEO_SCALE, payload: scale });
    }, []),
    
    setCropBounds: useCallback((bounds) => {
      dispatch({ type: ActionTypes.SET_CROP_BOUNDS, payload: bounds });
    }, []),
    
    // Annotation actions
    addAnnotation: useCallback((frameIndex, personId, keypointId, position) => {
      dispatch({ 
        type: ActionTypes.ADD_ANNOTATION, 
        payload: { frameIndex, personId, keypointId, position } 
      });
    }, []),
    
    setAnnotations: useCallback((annotations) => {
      dispatch({ type: ActionTypes.SET_ANNOTATIONS, payload: annotations });
    }, []),
    
    addPerson: useCallback((name, color) => {
      const id = generatePersonId(state.annotation.persons);
      const uniqueName = generateUniqueName(name, state.annotation.persons);
      const newPerson = { id, name: uniqueName, color };
      
      dispatch({ type: ActionTypes.ADD_PERSON, payload: newPerson });
      return newPerson;
    }, [state.annotation.persons]),
    
    editPerson: useCallback((id, updates) => {
      dispatch({ type: ActionTypes.EDIT_PERSON, payload: { id, updates } });
    }, []),
    
    deletePerson: useCallback((id) => {
      dispatch({ type: ActionTypes.DELETE_PERSON, payload: id });
    }, []),
    
    setSelectedPerson: useCallback((personId) => {
      dispatch({ type: ActionTypes.SET_SELECTED_PERSON, payload: personId });
    }, []),
    
    setSelectedKeypoint: useCallback((keypoint) => {
      dispatch({ type: ActionTypes.SET_SELECTED_KEYPOINT, payload: keypoint });
    }, []),
    
    // UI actions
    setActiveTab: useCallback((tab) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab });
    }, []),
    
    setAddPersonModal: useCallback((visible) => {
      dispatch({ type: ActionTypes.SET_ADD_PERSON_MODAL, payload: visible });
    }, []),
    
    setNewPersonName: useCallback((name) => {
      dispatch({ type: ActionTypes.SET_NEW_PERSON_NAME, payload: name });
    }, []),
    
    setInferencing: useCallback((inferencing) => {
      dispatch({ type: ActionTypes.SET_INFERENCING, payload: inferencing });
    }, []),
    
    // Compound actions
    createPerson: useCallback((name) => {
      const colorIndex = state.annotation.persons.length % PERSON_COLORS.length;
      const color = PERSON_COLORS[colorIndex];
      const id = generatePersonId(state.annotation.persons);
      const uniqueName = generateUniqueName(name, state.annotation.persons);
      const newPerson = { id, name: uniqueName, color };
      
      dispatch({ type: ActionTypes.ADD_PERSON, payload: newPerson });
      return newPerson;
    }, [state.annotation.persons]),
    
    selectPersonAndSwitchTab: useCallback((personId) => {
      dispatch({ type: ActionTypes.SET_SELECTED_PERSON, payload: personId });
      dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: TABS.KEYPOINTS });
      if (KEYPOINTS.length > 0) {
        dispatch({ type: ActionTypes.SET_SELECTED_KEYPOINT, payload: KEYPOINTS[0] });
      }
    }, []),
    
    resetState: useCallback(() => {
      dispatch({ type: ActionTypes.RESET_STATE });
    }, []),
    
    resetAnnotations: useCallback(() => {
      dispatch({ type: ActionTypes.RESET_ANNOTATIONS });
    }, []),
  };
  
  const value = {
    state,
    actions,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook to use app context
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

/**
 * Selector hooks for specific state slices
 */
export const useVideoState = () => {
  const { state } = useAppContext();
  return state.video;
};

export const useAnnotationState = () => {
  const { state } = useAppContext();
  return state.annotation;
};

export const useUIState = () => {
  const { state } = useAppContext();
  return state.ui;
};

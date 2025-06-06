/**
 * Person management service
 */

import { PERSON_COLORS } from '../../../constants';
import { generatePersonId, generateUniqueName } from '../../../utils/annotation';

/**
 * Create a new person
 * @param {string} name - Person name
 * @param {import('../../../types').Person[]} existingPersons - Existing persons
 * @returns {import('../../../types').Person} New person
 */
export const createPerson = (name, existingPersons = []) => {
  const id = generatePersonId(existingPersons);
  const uniqueName = generateUniqueName(name, existingPersons);
  const colorIndex = existingPersons.length % PERSON_COLORS.length;
  const color = PERSON_COLORS[colorIndex];
  
  return {
    id,
    name: uniqueName,
    color,
  };
};

/**
 * Validate person name
 * @param {string} name - Person name to validate
 * @returns {Object} Validation result
 */
export const validatePersonName = (name) => {
  const trimmedName = name?.trim();
  
  if (!trimmedName) {
    return {
      isValid: false,
      error: 'Person name cannot be empty',
    };
  }
  
  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: 'Person name cannot exceed 50 characters',
    };
  }
  
  if (!/^[a-zA-Z0-9\u4e00-\u9fa5\s_-]+$/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Person name contains invalid characters',
    };
  }
  
  return {
    isValid: true,
    error: null,
  };
};

/**
 * Check if person name is unique
 * @param {string} name - Person name
 * @param {import('../../../types').Person[]} persons - Existing persons
 * @param {string} excludeId - Person ID to exclude from check
 * @returns {boolean} Whether name is unique
 */
export const isPersonNameUnique = (name, persons, excludeId = null) => {
  const trimmedName = name?.trim().toLowerCase();
  
  return !persons.some(person => 
    person.id !== excludeId && 
    person.name.toLowerCase() === trimmedName
  );
};

/**
 * Get person by ID
 * @param {string} personId - Person ID
 * @param {import('../../../types').Person[]} persons - Persons array
 * @returns {import('../../../types').Person|null} Found person or null
 */
export const getPersonById = (personId, persons) => {
  return persons.find(person => person.id === personId) || null;
};

/**
 * Update person data
 * @param {string} personId - Person ID
 * @param {Object} updates - Updates to apply
 * @param {import('../../../types').Person[]} persons - Persons array
 * @returns {import('../../../types').Person[]} Updated persons array
 */
export const updatePerson = (personId, updates, persons) => {
  return persons.map(person =>
    person.id === personId
      ? { ...person, ...updates }
      : person
  );
};

/**
 * Remove person from list
 * @param {string} personId - Person ID to remove
 * @param {import('../../../types').Person[]} persons - Persons array
 * @returns {import('../../../types').Person[]} Updated persons array
 */
export const removePerson = (personId, persons) => {
  return persons.filter(person => person.id !== personId);
};

/**
 * Get person statistics
 * @param {import('../../../types').Person} person - Person
 * @param {import('../../../types').Annotations} annotations - Annotations data
 * @returns {Object} Person statistics
 */
export const getPersonStats = (person, annotations) => {
  let totalFrames = 0;
  let totalKeypoints = 0;
  
  Object.values(annotations).forEach(frameData => {
    const personData = frameData[person.id];
    if (personData && Object.keys(personData).length > 0) {
      totalFrames++;
      totalKeypoints += Object.keys(personData).length;
    }
  });
  
  return {
    totalFrames,
    totalKeypoints,
    averageKeypointsPerFrame: totalFrames > 0 ? Math.round(totalKeypoints / totalFrames * 10) / 10 : 0,
  };
};

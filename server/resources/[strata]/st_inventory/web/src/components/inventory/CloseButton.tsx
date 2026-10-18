import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { fetchNui } from '../../utils/fetchNui';

const CloseButton: React.FC = () => {
  const handleClose = () => {
    fetchNui('exit');
  };

  return (
    <button className="close-name" onClick={handleClose} title="Close (ESC)">
      <FontAwesomeIcon icon={faXmark} />
    </button>
  );
};

export default CloseButton;

import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { updateDesignRequest } from '../../utils/fetchRequests';

const EditableText = ({ initialText, designId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div align='center' onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <TextField
          // onBlur={() => setIsEditing(false)}
          value={text}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  onClick={async () => {
                    try {
                      await updateDesignRequest(designId, { title: text });
                      setIsEditing(false);
                    } catch (error) {
                      dispatch(
                        setMessage({
                          severity: 'error',
                          text: 'Design: update title at homepage ' + err,
                        })
                      );
                    }
                  }}
                >
                  <CheckCircleIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <span fontSize='30vw'>{text}</span>
      )}
    </div>
  );
};

export default EditableText;

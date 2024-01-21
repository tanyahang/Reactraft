import React, { Fragment, useState } from 'react';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';

import Tooltip from '@mui/material/Tooltip';

import BackdropSnackbar from './BackdropSnackbar';
import Backdrop from '@mui/material/Backdrop';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import {
  TbSquareLetterT,
  TbSquareLetterD,
  TbSquareLetterW,
  TbSquareLetterS,
} from 'react-icons/tb';

import '../../styles/keyboardShortcut.scss';
import { Typography } from '@mui/material';

export default function ViewKeyboardShortcut() {
  const [open, setOpen] = useState(false);
  return (
    <Box
      sx={{
        display: 'flex',
        width: '40px',
        justifyContent: 'center',
      }}
    >
      <Tooltip title='View keyboard shortcuts'>
        <Fab
          size='small'
          component='label'
          variant='contained'
          onClick={() => setOpen(true)}
        >
          <KeyboardIcon />
        </Fab>
      </Tooltip>
      <BackdropSnackbar open={open} setOpen={setOpen} />

      <ShortcutBackdrop open={open} setOpen={setOpen} />
    </Box>
  );
}

function ShortcutBackdrop({ open, setOpen }) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff4D',
      }}
      open={open}
      onDoubleClick={() => setOpen(false)}
    >
      <List className='keyboard-shortcuts'>
        <ListItem className='shortcut'>
          <ListItemIcon sx={{ color: 'white' }}>esc</ListItemIcon>
          <ListItemText sx={{ marginLeft: '10px' }}>
            Exit full screen
          </ListItemText>
        </ListItem>

        <Shortcut
          icon={<TbSquareLetterT size='20px' />}
          text='Toggle view Dom tree'
        />

        <Shortcut icon={<TbSquareLetterD size='20px' />} text='Delete Design' />
        <Shortcut
          icon={<TbSquareLetterW size='20px' />}
          text='Select Previous Component'
        />
        <Shortcut
          icon={<TbSquareLetterS size='20px' />}
          text='Select Next Component'
        />
      </List>
    </Backdrop>
  );
}

function Shortcut({ icon, text }) {
  return (
    <Fragment>
      <Divider />
      <ListItem className='shortcut'>
        <Stack direction='row'>
          <Typography>alt + </Typography>
          {icon}
        </Stack>
        <ListItemText sx={{ marginLeft: '10px' }}>{text}</ListItemText>
      </ListItem>
    </Fragment>
  );
}
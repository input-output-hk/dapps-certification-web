import React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

interface Props {
    onToggle: (isChecked: boolean) => void;
}

const CustomSwitch: React.FC<Props> = ({ onToggle }) => {
  const [checked, setChecked] = React.useState(false);

  const toggleChecked = () => {
    setChecked((prev) => {
      const newChecked = !prev;
      onToggle(newChecked);
      return newChecked
    });
  };

  const CustomSwitchComponent = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
      '&.Mui-checked': {
        '& .MuiSwitch-thumb': {
          backgroundColor: '#7e7dc4',
        },
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: '#A5A4BF',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: '#001e3c',
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: '#aab4be',
    },
  }));

  return (
    <FormGroup style={{"marginBottom": "20px", "flexFlow": "row-reverse"}}>
      <FormControlLabel
        control={<CustomSwitchComponent size="small" checked={checked} onChange={toggleChecked} />}
        label={`${checked? 'Customized Testing':'Default Testing'}`}
      />
    </FormGroup>
  );
}

export default CustomSwitch
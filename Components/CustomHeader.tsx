import React from 'react';
import {Header} from '@rneui/themed';

interface CustomHeaderProps {
  title: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({title}) => {
  return (
    <Header
      backgroundColor="#CDB4DB"
      centerComponent={{
        text: title,
        style: {
          color: '#272640',
          fontSize: 18,
          fontWeight: 'bold',
        },
      }}
      placement="center"
    />
  );
};

export default CustomHeader;

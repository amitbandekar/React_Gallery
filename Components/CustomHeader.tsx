import React from 'react';
import { Header } from '@rneui/themed';

const CustomHeader: React.FC<{ title: string }> = ({ title }) => {
    return (
    <Header
      backgroundColor="#CDB4DB"
      centerComponent={{
        text: title,
        style: { color: "#272640" ,fontSize:15 }
      }}
      placement="center"
    />
  );
};

export default CustomHeader;

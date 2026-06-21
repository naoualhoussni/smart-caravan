import React from 'react';
import { View } from 'react-native';

export const MapView = ({ children, style }: any) => {
  return (
    <View style={[{flex: 1}, style]}>
       {React.createElement('iframe', {
         src: 'https://www.openstreetmap.org/export/embed.html?bbox=-7.0%2C31.0%2C-4.0%2C35.0&layer=mapnik&marker=33.5333%2C-5.1167',
         style: { width: '100%', height: '100%', border: 'none' }
       })}
    </View>
  );
};

export const Marker = ({ coordinate, title, description, pinColor }: any) => {
  return null;
};

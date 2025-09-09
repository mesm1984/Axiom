import React from 'react';
import { View, Text } from 'react-native';

const TestApp = () => {
  console.log('🟢 TestApp is rendering');

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 30, color: 'white', fontWeight: 'bold' }}>
        TEST APP WORKS!
      </Text>
    </View>
  );
};

export default TestApp;

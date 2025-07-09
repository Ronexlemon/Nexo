import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  onKeyPress: (key: string) => void;
};

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'X'];


const groupKeys = (arr: string[], size = 3) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export const CustomKeyboard = ({ onKeyPress }: Props) => {
  const keyRows = groupKeys(keys, 3);

  return (
    <View style={styles.container}>
      {keyRows.map((row, rowIndex) => (
        <View style={styles.row} key={`row-${rowIndex}`}>
          {row.map((key, i) => (
            <TouchableOpacity
              key={`${key}-${i}`}
              style={styles.key}
              onPress={() => onKeyPress(key)}
            >
              <Text style={styles.keyText}>{key === ' ' ? '␣' : key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  key: {
    flex: 1,
    height: 60,
    marginHorizontal: 6,
    borderRadius: 30, // Rounded
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});

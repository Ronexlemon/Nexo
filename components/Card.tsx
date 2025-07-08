import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomCardProps {
  title: string;
  children?: ReactNode;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
}

const Card: React.FC<CustomCardProps> = ({
  title,
  children,
  containerStyle,
  titleStyle,
  contentStyle,
}) => {
  return (
    <View style={[styles.card, containerStyle]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  content: {
    // Optional style for content wrapper
  },
});

export default Card;

import React, { useCallback, forwardRef } from 'react';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Text, StyleSheet } from 'react-native';

interface Props {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  Component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
}

export const CustomBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ title, description, children, snapPoints = ['80%'], onClose, Component, componentProps }, ref) => {
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          enableTouchThrough={false}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onDismiss={onClose}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.contentContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
          {Component ? <Component {...componentProps} /> : children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
});

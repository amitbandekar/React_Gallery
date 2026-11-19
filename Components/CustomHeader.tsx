import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

interface CustomHeaderProps {
  title?: string;
  subtitle?: string;
  onSecretVaultGesture?: () => void;
  rightComponent?: React.ReactNode;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title = 'Gallery',
  subtitle,
  onSecretVaultGesture,
  rightComponent,
}) => {
  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
      <View style={styles.titleColumn}>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={onSecretVaultGesture}
          delayLongPress={1200}>
          <Text style={styles.titleText}>{title}</Text>
        </TouchableOpacity>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>

      {rightComponent ? (
        <View style={styles.rightSection}>{rightComponent}</View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0b0f19',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  titleColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  titleText: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default CustomHeader;

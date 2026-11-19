import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {setVaultPassword, verifyVaultPassword} from './vaultService';

interface VaultPasswordModalProps {
  visible: boolean;
  mode: 'set' | 'unlock';
  onSuccess: () => void;
  onClose: () => void;
}

const VaultPasswordModal: React.FC<VaultPasswordModalProps> = ({
  visible,
  mode,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (visible) {
      setPassword('');
      setConfirmPassword('');
      setShowPass(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Notice', 'Please enter a PIN or password.');
      return;
    }

    if (mode === 'set') {
      if (password.length < 4) {
        Alert.alert('Notice', 'Password must be at least 4 characters/digits.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match. Please try again.');
        return;
      }
      const success = await setVaultPassword(password);
      if (success) {
        Alert.alert('Success', 'Private vault password created successfully!');
        onSuccess();
      } else {
        Alert.alert('Error', 'Failed to save password. Please try again.');
      }
    } else {
      // Unlock mode
      const valid = await verifyVaultPassword(password);
      if (valid) {
        onSuccess();
      } else {
        Alert.alert(
          'Incorrect Password',
          'The password you entered is incorrect.',
        );
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.dialogTitle}>
            {mode === 'set' ? 'Set Vault Password' : 'Unlock Private Vault'}
          </Text>
          <Text style={styles.dialogSubtitle}>
            {mode === 'set'
              ? 'Create a PIN or password to secure your hidden images and videos.'
              : 'Enter your password to access your hidden vault.'}
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter PIN or Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              autoFocus={true}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.eyeBtn}>
              <Text style={styles.eyeEmoji}>{showPass ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          {mode === 'set' ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm PIN or Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>
                {mode === 'set' ? 'Set Password' : 'Unlock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  dialogSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#475569',
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    height: 48,
    color: '#ffffff',
    fontSize: 16,
  },
  eyeBtn: {
    padding: 6,
  },
  eyeEmoji: {
    fontSize: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#334155',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 15,
  },
  submitBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#2563eb',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default VaultPasswordModal;

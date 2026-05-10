import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { changePassword } from '../database/database';
import { useAuth } from '../utils/AuthContext';

export default function PengaturanScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Perhatian', 'Semua field password harus diisi.');
      return;
    }
    if (newPassword.length < 4) {
      Alert.alert('Perhatian', 'Password baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Perhatian', 'Password baru dan konfirmasi tidak cocok.');
      return;
    }
    setSaving(true);
    try {
      const success = await changePassword(currentUser.username, currentPassword, newPassword);
      if (success) {
        Alert.alert('Berhasil', 'Password berhasil diubah!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Gagal', 'Password saat ini tidak benar.');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#F59E0B" />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Change Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lock-reset" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Ganti Password</Text>
          </View>

          {/* Current Password */}
          <Text style={styles.label}>Password Saat Ini</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan password saat ini"
              placeholderTextColor="#475569"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <MaterialCommunityIcons
                name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={styles.label}>Password Baru</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-plus-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan password baru"
              placeholderTextColor="#475569"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <MaterialCommunityIcons
                name={showNew ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Konfirmasi Password Baru</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-check-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Ulangi password baru"
              placeholderTextColor="#475569"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <MaterialCommunityIcons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={saving}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="content-save" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Password Baru'}</Text>
          </TouchableOpacity>
        </View>

        {/* Developer Info Section */}
        <View style={[styles.section, styles.devSection]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-circle" size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Informasi Developer</Text>
          </View>

          <View style={styles.devCard}>
            {/* Avatar placeholder with icon */}
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={48} color="#6366F1" />
            </View>

            <View style={styles.devInfo}>
              <Text style={styles.devName}>Muhammad Rafsan Al Farisi</Text>
              <View style={styles.devRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={14} color="#94A3B8" />
                <Text style={styles.devDetail}>NIM: 2341760039</Text>
              </View>
              <View style={styles.devRow}>
                <MaterialCommunityIcons name="school-outline" size={14} color="#94A3B8" />
                <Text style={styles.devDetail}>Teknologi Informasi – Polinema</Text>
              </View>
              <View style={styles.devRow}>
                <MaterialCommunityIcons name="domain" size={14} color="#94A3B8" />
                <Text style={styles.devDetail}>PT. Sumber Daya Makmur</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <MaterialCommunityIcons name="calendar-check" size={24} color="#6366F1" />
          <Text style={styles.appInfoTitle}>Agenda Nusantara</Text>
          <Text style={styles.appInfoVersion}>Versi 1.0.0 • 2026</Text>
          <Text style={styles.appInfoCopy}>© PT. Sumber Daya Makmur</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  backText: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  devSection: {
    borderColor: '#6366F1' + '40',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  input: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  devCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  devInfo: {
    flex: 1,
    gap: 6,
  },
  devName: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  devDetail: {
    color: '#94A3B8',
    fontSize: 12,
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 20,
  },
  appInfoTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  appInfoVersion: {
    color: '#64748B',
    fontSize: 12,
  },
  appInfoCopy: {
    color: '#334155',
    fontSize: 11,
  },
});

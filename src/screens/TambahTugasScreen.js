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
  Platform,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addTask } from '../database/database';

// Simple date picker using modal
function DatePickerModal({ visible, onClose, onSelect, currentDate }) {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [day, setDay] = useState(String(new Date().getDate()).padStart(2, '0'));

  const months = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ];

  const getDaysInMonth = (y, m) => new Date(parseInt(y), parseInt(m), 0).getDate();

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y <= currentYear + 5; y++) years.push(y.toString());

  const handleConfirm = () => {
    const maxDay = getDaysInMonth(year, month);
    const clampedDay = Math.min(parseInt(day), maxDay);
    const d = String(clampedDay).padStart(2, '0');
    onSelect(`${year}-${month}-${d}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={dpStyles.overlay}>
        <View style={dpStyles.modal}>
          <Text style={dpStyles.title}>Pilih Tanggal Jatuh Tempo</Text>

          <View style={dpStyles.pickerRow}>
            {/* Day */}
            <View style={dpStyles.col}>
              <Text style={dpStyles.colLabel}>Tanggal</Text>
              <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                {Array.from({ length: getDaysInMonth(year, month) }, (_, i) =>
                  String(i + 1).padStart(2, '0')
                ).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[dpStyles.item, day === d && dpStyles.selectedItem]}
                    onPress={() => setDay(d)}
                  >
                    <Text style={[dpStyles.itemText, day === d && dpStyles.selectedText]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month */}
            <View style={dpStyles.col}>
              <Text style={dpStyles.colLabel}>Bulan</Text>
              <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                {months.map((m, idx) => {
                  const mStr = String(idx + 1).padStart(2, '0');
                  return (
                    <TouchableOpacity
                      key={mStr}
                      style={[dpStyles.item, month === mStr && dpStyles.selectedItem]}
                      onPress={() => setMonth(mStr)}
                    >
                      <Text style={[dpStyles.itemText, month === mStr && dpStyles.selectedText]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Year */}
            <View style={dpStyles.col}>
              <Text style={dpStyles.colLabel}>Tahun</Text>
              <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[dpStyles.item, year === y && dpStyles.selectedItem]}
                    onPress={() => setYear(y)}
                  >
                    <Text style={[dpStyles.itemText, year === y && dpStyles.selectedText]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={dpStyles.btnRow}>
            <TouchableOpacity style={dpStyles.cancelBtn} onPress={onClose}>
              <Text style={dpStyles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dpStyles.confirmBtn} onPress={handleConfirm}>
              <Text style={dpStyles.confirmText}>Pilih</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dpStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    height: 180,
  },
  col: {
    flex: 1,
  },
  colLabel: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
  },
  item: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  itemText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function TambahTugasScreen({ navigation, route }) {
  const category = route?.params?.category ?? 'biasa';
  const isPenting = category === 'penting';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Januari','Februari','Maret','April','Mei','Juni',
      'Juli','Agustus','September','Oktober','November','Desember',
    ];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Perhatian', 'Judul tugas tidak boleh kosong.');
      return;
    }
    if (!dueDate) {
      Alert.alert('Perhatian', 'Pilih tanggal jatuh tempo terlebih dahulu.');
      return;
    }
    setSaving(true);
    try {
      await addTask(title.trim(), description.trim(), dueDate, category);
      Alert.alert('Berhasil', `Tugas ${isPenting ? 'penting' : 'biasa'} berhasil disimpan!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const accentColor = isPenting ? '#EF4444' : '#22C55E';
  const bgAccent = isPenting ? '#450A0A' : '#052E16';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: accentColor + '40' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={accentColor} />
          <Text style={[styles.backText, { color: accentColor }]}>Kembali</Text>
        </TouchableOpacity>
        <View style={[styles.badge, { backgroundColor: bgAccent, borderColor: accentColor + '60' }]}>
          <MaterialCommunityIcons
            name={isPenting ? 'alert-circle' : 'plus-circle'}
            size={14}
            color={accentColor}
          />
          <Text style={[styles.badgeText, { color: accentColor }]}>
            {isPenting ? 'Penting' : 'Biasa'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>
          {isPenting ? '🔴 Tambah Tugas Penting' : '🟢 Tambah Tugas Biasa'}
        </Text>
        <Text style={styles.pageSubtitle}>Isi detail tugas yang ingin Anda tambahkan</Text>

        {/* Date Picker */}
        <Text style={styles.label}>Tanggal Jatuh Tempo *</Text>
        <TouchableOpacity
          style={[styles.dateButton, dueDate && { borderColor: accentColor }]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="calendar" size={20} color={dueDate ? accentColor : '#64748B'} />
          <Text style={[styles.dateText, !dueDate && { color: '#475569' }]}>
            {dueDate ? formatDisplayDate(dueDate) : 'Pilih tanggal jatuh tempo'}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.label}>Judul Tugas *</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan judul tugas..."
          placeholderTextColor="#475569"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Description */}
        <Text style={styles.label}>Deskripsi Tugas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Masukkan deskripsi tugas (opsional)..."
          placeholderTextColor="#475569"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accentColor }, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Tugas'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={setDueDate}
        currentDate={dueDate}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 4,
    marginTop: 8,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 28,
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 10,
  },
  dateText: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#F1F5F9',
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllTasks, toggleTaskDone } from '../database/database';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = [
    'Jan','Feb','Mar','Apr','Mei','Jun',
    'Jul','Agu','Sep','Okt','Nov','Des',
  ];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
};

function TaskItem({ item, onToggle }) {
  console.log('TaskItem rendering:', { id: item.id, title: item.title, category: item.category });
  const isPenting = item.category === 'penting';
  const arrowColor = isPenting ? '#EF4444' : '#22C55E';

  return (
    <TouchableOpacity
      style={[styles.taskCard, item.is_done && styles.taskCardDone]}
      onPress={() => onToggle(item)}
      activeOpacity={0.8}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: arrowColor }]} />

      {/* Checkbox */}
      <View style={[styles.checkbox, item.is_done && styles.checkboxDone]}>
        {item.is_done ? (
          <MaterialCommunityIcons name="check" size={14} color="#fff" />
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: isPenting ? '#450A0A' : '#052E16' }]}>
            <Text style={[styles.categoryText, { color: arrowColor }]}>
              {isPenting ? 'Penting' : 'Biasa'}
            </Text>
          </View>
          {item.is_done ? (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>✓ Selesai</Text>
            </View>
          ) : null}
        </View>

        <Text
          style={[styles.taskTitle, item.is_done && styles.taskTitleDone]}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        {item.description ? (
          <Text style={styles.taskDesc} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.dateRow}>
          <View style={{ justifyContent: 'center' }}>
            <MaterialCommunityIcons name="calendar-clock" size={12} color="#64748B" />
          </View>
          <Text style={styles.dateText}>Jatuh tempo: {formatDate(item.due_date)}</Text>
        </View>
      </View>

      {/* Arrow icon */}
      <View style={{ justifyContent: 'center', paddingRight: 4 }}>
        <MaterialCommunityIcons name="chevron-right" size={24} color={arrowColor} />
      </View>
    </TouchableOpacity>
  );
}

export default function DaftarTugasScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('semua'); // semua | penting | biasa | selesai | belum

  const loadTasks = useCallback(async () => {
    try {
      const all = await getAllTasks();
      setTasks(all);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleToggle = async (item) => {
    const action = item.is_done ? 'Tandai belum selesai?' : 'Tandai sebagai selesai?';
    Alert.alert('Ubah Status Tugas', action, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya',
        onPress: async () => {
          await toggleTaskDone(item.id, item.is_done);
          loadTasks();
        },
      },
    ]);
  };

  const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'penting', label: 'Penting' },
    { key: 'biasa', label: 'Biasa' },
    { key: 'selesai', label: 'Selesai' },
    { key: 'belum', label: 'Belum' },
  ];

  const filtered = tasks.filter((t) => {
    if (filter === 'penting') return t.category === 'penting';
    if (filter === 'biasa') return t.category === 'biasa';
    if (filter === 'selesai') return t.is_done === 1;
    if (filter === 'belum') return t.is_done === 0;
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#0F766E" />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Tugas</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{filtered.length}</Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View>
            <MaterialCommunityIcons name="inbox-outline" size={60} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Belum ada tugas</Text>
          <Text style={styles.emptySubtitle}>Tambahkan tugas dari halaman Beranda</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TaskItem item={item} onToggle={handleToggle} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#0F766E',
    borderBottomWidth: 1,
    borderBottomColor: '#0E7490',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 36,
  },
  countBadge: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'absolute',
    right: 16,
    top: 60,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  chipText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  list: {
    padding: 14,
    gap: 10,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingRight: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  taskCardDone: {
    opacity: 0.65,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginLeft: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  taskContent: {
    flex: 1,
    paddingVertical: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  doneBadge: {
    backgroundColor: '#052E16',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  doneText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '600',
  },
  taskTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskDesc: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: '#64748B',
    fontSize: 11,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
  },
});

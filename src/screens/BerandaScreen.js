import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getTaskStats, getCompletedPerDay } from '../database/database';
import { useAuth } from '../utils/AuthContext';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
  {
    id: 'tambah-penting',
    label: 'Tambah Tugas\nPenting',
    icon: 'alert-circle',
    color: '#EF4444',
    bgColor: '#450A0A',
    screen: 'TambahTugas',
    params: { category: 'penting' },
  },
  {
    id: 'tambah-biasa',
    label: 'Tambah Tugas\nBiasa',
    icon: 'plus-circle',
    color: '#22C55E',
    bgColor: '#052E16',
    screen: 'TambahTugas',
    params: { category: 'biasa' },
  },
  {
    id: 'daftar-tugas',
    label: 'Daftar\nTugas',
    icon: 'format-list-checks',
    color: '#3B82F6',
    bgColor: '#172554',
    screen: 'DaftarTugas',
    params: {},
  },
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: 'cog',
    color: '#F59E0B',
    bgColor: '#451A03',
    screen: 'Pengaturan',
    params: {},
  },
];

// Mini bar chart component
function MiniBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <View style={chartStyles.empty}>
        <MaterialCommunityIcons name="chart-bar" size={32} color="#334155" />
        <Text style={chartStyles.emptyText}>Belum ada data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={chartStyles.container}>
      {data.map((item, i) => {
        const heightPercent = (item.count / maxVal) * 100;
        const dateStr = item.date ? item.date.slice(5) : ''; // MM-DD
        return (
          <View key={i} style={chartStyles.barGroup}>
            <Text style={chartStyles.countLabel}>{item.count}</Text>
            <View style={chartStyles.barWrapper}>
              <View
                style={[
                  chartStyles.bar,
                  { height: `${Math.max(heightPercent, 8)}%` },
                ]}
              />
            </View>
            <Text style={chartStyles.dateLabel}>{dateStr}</Text>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
    paddingTop: 20,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  barWrapper: {
    width: 20,
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  countLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginBottom: 2,
  },
  dateLabel: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 4,
  },
  empty: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    color: '#475569',
    fontSize: 12,
  },
});

export default function BerandaScreen({ navigation }) {
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const s = await getTaskStats();
      const c = await getCompletedPerDay();
      setStats(s);
      setChartData(c);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {currentUser?.username} 👋</Text>
          <Text style={styles.headerTitle}>Agenda Nusantara</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: '#22C55E' }]}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#22C55E" />
            <Text style={styles.statNumber}>{stats?.done ?? 0}</Text>
            <Text style={styles.statLabel}>Tugas Selesai</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#F59E0B' }]}>
            <MaterialCommunityIcons name="clock-outline" size={28} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats?.not_done ?? 0}</Text>
            <Text style={styles.statLabel}>Belum Selesai</Text>
          </View>
        </View>

        {/* Category stats */}
        <View style={styles.categoryRow}>
          <View style={[styles.catCard, { borderLeftColor: '#EF4444' }]}>
            <Text style={styles.catLabel}>🔴 Penting</Text>
            <Text style={styles.catDetail}>
              Selesai: <Text style={{ color: '#22C55E' }}>{stats?.penting_done ?? 0}</Text>
              {' · '}Belum: <Text style={{ color: '#F59E0B' }}>{stats?.penting_not_done ?? 0}</Text>
            </Text>
          </View>
          <View style={[styles.catCard, { borderLeftColor: '#22C55E' }]}>
            <Text style={styles.catLabel}>🟢 Biasa</Text>
            <Text style={styles.catDetail}>
              Selesai: <Text style={{ color: '#22C55E' }}>{stats?.biasa_done ?? 0}</Text>
              {' · '}Belum: <Text style={{ color: '#F59E0B' }}>{stats?.biasa_not_done ?? 0}</Text>
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="chart-bar" size={18} color="#6366F1" />
            <Text style={styles.chartTitle}>Tugas Selesai per Hari (7 hari terakhir)</Text>
          </View>
          <MiniBarChart data={chartData} />
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { borderColor: item.color + '40' }]}
              onPress={() => navigation.navigate(item.screen, item.params)}
              activeOpacity={0.8}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  greeting: {
    fontSize: 13,
    color: '#94A3B8',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#450A0A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F1F5F9',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  catCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  catLabel: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  catDetail: {
    color: '#94A3B8',
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    margin: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chartTitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  menuCard: {
    width: (width - 28 - 12 * 3) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    gap: 12,
  },
  menuIconBg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

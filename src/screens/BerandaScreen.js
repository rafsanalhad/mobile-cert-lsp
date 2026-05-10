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

const formatToday = () => {
  const today = new Date();
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today);
};

const MENU_ITEMS = [
  {
    id: 'tambah-penting',
    label: 'Tambah Tugas\nPenting',
    icon: 'alert-circle',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    screen: 'TambahTugas',
    params: { category: 'penting' },
  },
  {
    id: 'tambah-biasa',
    label: 'Tambah Tugas\nBiasa',
    icon: 'plus-circle',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    screen: 'TambahTugas',
    params: { category: 'biasa' },
  },
  {
    id: 'daftar-tugas',
    label: 'Daftar\nTugas',
    icon: 'format-list-checks',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    screen: 'DaftarTugas',
    params: {},
  },
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: 'cog',
    color: '#D97706',
    bgColor: '#FFFBEB',
    screen: 'Pengaturan',
    params: {},
  },
];

// Mini bar chart component
function MiniBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <View style={chartStyles.empty}>
        <MaterialCommunityIcons name="chart-bar" size={32} color="#94A3B8" />
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
    backgroundColor: '#0F766E',
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
    color: '#64748B',
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Beranda</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="logout" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Halo, {currentUser?.username}! 👋</Text>
          <Text style={styles.todayText}>{formatToday()}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabelSmall}>TUGAS SELESAI</Text>
            <Text style={[styles.statNumber, { color: '#16A34A' }]}>{stats?.done ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabelSmall}>BELUM SELESAI</Text>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>{stats?.not_done ?? 0}</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>TUGAS SELESAI / HARI [BONUS]</Text>
          <MiniBarChart data={chartData} />
        </View>

        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.screen, item.params)}
              activeOpacity={0.85}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#4BA39A',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF44',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  greetingBlock: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  todayText: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  statLabelSmall: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  statNumber: {
    marginTop: 4,
    fontSize: 34,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  catCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  catLabel: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  catDetail: {
    color: '#64748B',
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chartTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCard: {
    width: (width - 28 - 12 * 3) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  menuIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});

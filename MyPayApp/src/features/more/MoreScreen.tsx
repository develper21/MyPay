import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../auth/authSlice';
import { RootState } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const MoreScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user, biometricEnabled } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const menuItems = [
    { title: 'Profile', subtitle: 'Manage your account information' },
    { title: 'Security', subtitle: 'Biometrics, PIN, and security settings' },
    { title: 'Notifications', subtitle: 'Alert and notification preferences' },
    { title: 'Privacy', subtitle: 'Data privacy and export options' },
    { title: 'Help & Support', subtitle: 'FAQs and contact support' },
    { title: 'About', subtitle: 'App version and legal information' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item, index) => (
          <Card key={index} style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Card style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Biometric Authentication</Text>
              <Text style={styles.menuItemSubtitle}>
                {biometricEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: biometricEnabled ? '#4caf50' : '#ccc' }
            ]} />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Card style={styles.menuItem}>
          <Button
            title="Export Data (CSV)"
            onPress={() => Alert.alert('Coming Soon', 'Data export feature will be available soon')}
            variant="secondary"
            style={styles.actionButton}
          />
        </Card>
        
        <Card style={styles.menuItem}>
          <Button
            title="Clear Cache"
            onPress={() => Alert.alert('Coming Soon', 'Cache clearing feature will be available soon')}
            variant="secondary"
            style={styles.actionButton}
          />
        </Card>

        <Card style={styles.menuItem}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            style={styles.actionButton}
          />
        </Card>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2025 MyPay App</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  menuItem: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionButton: {
    marginVertical: 4,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#ccc',
  },
});

export default MoreScreen;

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useExpenses } from './_layout';

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export default function ViewSplit() {
  const { calculateSettlements } = useExpenses();
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    const results = calculateSettlements();
    setSettlements(results);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Final Split</Text>

      {settlements.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No settlements needed!</Text>
        </View>
      ) : (
        <View style={styles.settlementsContainer}>
          {settlements.map((settlement, index) => (
            <View key={index} style={styles.settlementCard}>
              <Text style={styles.settlementText}>
                <Text style={styles.personName}>{settlement.from}</Text> owes{' '}
                <Text style={styles.personName}>{settlement.to}</Text>
              </Text>
              <Text style={styles.amount}>
                ${settlement.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>
          All expenses have been split fairly. Make the above payments to settle up!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    color: '#2196F3',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
  },
  settlementsContainer: {
    padding: 20,
  },
  settlementCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settlementText: {
    fontSize: 16,
    marginBottom: 5,
  },
  personName: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryCard: {
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
}); 
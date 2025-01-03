import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Link } from 'expo-router';
import { useExpenses } from './_layout';

export default function Home() {
  const { expenses, parties } = useExpenses();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SplitIt</Text>
      
      {parties.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Add parties to start splitting bills</Text>
          <Link href="/manage-parties" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Parties</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <>
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expenses yet</Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.expenseCard}>
                  <Text style={styles.expenseDescription}>{item.description}</Text>
                  <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
                  <Text style={styles.expensePaidBy}>Paid by: {item.paidBy}</Text>
                  <Text style={styles.expenseSharedBy}>
                    Shared by: {item.sharedBy.join(', ')}
                  </Text>
                </View>
              )}
            />
          )}

          <View style={styles.buttonContainer}>
            <Link href="/add-expense" asChild>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/manage-parties" asChild>
              <TouchableOpacity style={styles.manageButton}>
                <Text style={styles.manageButtonText}>Manage Parties</Text>
              </TouchableOpacity>
            </Link>

            {expenses.length > 0 && (
              <Link href="/view-split" asChild>
                <TouchableOpacity style={styles.viewSplitButton}>
                  <Text style={styles.viewSplitButtonText}>View Split</Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2196F3',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  expenseCard: {
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
  expenseDescription: {
    fontSize: 18,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 5,
  },
  expensePaidBy: {
    color: '#666',
  },
  expenseSharedBy: {
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    gap: 10,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  manageButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  manageButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  viewSplitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewSplitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});

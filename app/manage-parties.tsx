import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useExpenses } from './_layout';
import { router } from 'expo-router';

export default function ManageParties() {
  const { parties, addParty, removeParty } = useExpenses();
  const [newParty, setNewParty] = useState('');

  const handleAddParty = () => {
    if (newParty.trim()) {
      addParty(newParty.trim());
      setNewParty('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Parties</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newParty}
          onChangeText={setNewParty}
          placeholder="Enter name"
          onSubmitEditing={handleAddParty}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddParty}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={parties}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.partyCard}>
            <Text style={styles.partyName}>{item}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeParty(item)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No parties added yet</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.doneButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2196F3',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  partyCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partyName: {
    fontSize: 18,
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
}); 
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useExpenses } from './_layout';

export default function AddExpense() {
  const { addExpense, parties } = useExpenses();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [selectedParties, setSelectedParties] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!description || !amount || !paidBy || selectedParties.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      paidBy,
      sharedBy: selectedParties,
    };

    addExpense(newExpense);
    router.push('/');
  };

  const togglePartySelection = (party: string) => {
    if (selectedParties.includes(party)) {
      setSelectedParties(selectedParties.filter(p => p !== party));
    } else {
      setSelectedParties([...selectedParties, party]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Expense</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What was it for?"
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="How much was it?"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Paid By</Text>
        <View style={styles.partyList}>
          {parties.map(party => (
            <TouchableOpacity
              key={party}
              style={[
                styles.partyButton,
                paidBy === party && styles.partyButtonSelected
              ]}
              onPress={() => setPaidBy(party)}
            >
              <Text style={[
                styles.partyButtonText,
                paidBy === party && styles.partyButtonTextSelected
              ]}>
                {party}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Shared By</Text>
        <View style={styles.partyList}>
          {parties.map(party => (
            <TouchableOpacity
              key={party}
              style={[
                styles.partyButton,
                selectedParties.includes(party) && styles.partyButtonSelected
              ]}
              onPress={() => togglePartySelection(party)}
            >
              <Text style={[
                styles.partyButtonText,
                selectedParties.includes(party) && styles.partyButtonTextSelected
              ]}>
                {party}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.push('/')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  partyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  partyButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  partyButtonSelected: {
    backgroundColor: '#2196F3',
  },
  partyButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  partyButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
}); 
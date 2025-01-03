import { Stack } from 'expo-router';
import { createContext, useContext, useState } from 'react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  sharedBy: string[];
}

interface ExpenseContextType {
  expenses: Expense[];
  parties: string[];
  addExpense: (expense: Expense) => void;
  addParty: (name: string) => void;
  removeParty: (name: string) => void;
  calculateSettlements: () => { from: string; to: string; amount: number; }[];
}

export const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [parties, setParties] = useState<string[]>([]);

  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  };

  const addParty = (name: string) => {
    if (!parties.includes(name)) {
      setParties([...parties, name]);
    }
  };

  const removeParty = (name: string) => {
    setParties(parties.filter(p => p !== name));
  };

  const calculateSettlements = () => {
    // Create a balance sheet for each person
    const balances = new Map<string, number>();
    
    // Initialize balances for all parties
    parties.forEach(party => {
      balances.set(party, 0);
    });
    
    // Calculate what each person paid and owes
    expenses.forEach(expense => {
      // Add what the payer paid
      balances.set(
        expense.paidBy, 
        (balances.get(expense.paidBy) || 0) + expense.amount
      );
      
      // Subtract what each person owes
      const perPerson = expense.amount / expense.sharedBy.length;
      expense.sharedBy.forEach(person => {
        balances.set(
          person, 
          (balances.get(person) || 0) - perPerson
        );
      });
    });

    // Convert balances to settlements
    const settlements: { from: string; to: string; amount: number; }[] = [];
    const people = Array.from(balances.keys());
    
    // Find people who owe money (negative balance)
    // and match them with people who are owed money (positive balance)
    while (people.length > 1) {
      const from = people.find(p => (balances.get(p) || 0) < -0.01);
      const to = people.find(p => (balances.get(p) || 0) > 0.01);
      
      if (!from || !to) break;
      
      const fromBalance = Math.abs(balances.get(from) || 0);
      const toBalance = balances.get(to) || 0;
      const amount = Math.min(fromBalance, toBalance);
      
      if (amount > 0) {
        settlements.push({ from, to, amount });
        balances.set(from, (balances.get(from) || 0) + amount);
        balances.set(to, (balances.get(to) || 0) - amount);
      }
      
      // Remove settled people from the list
      if (Math.abs(balances.get(from) || 0) < 0.01) {
        people.splice(people.indexOf(from), 1);
      }
      if (Math.abs(balances.get(to) || 0) < 0.01) {
        people.splice(people.indexOf(to), 1);
      }
    }

    return settlements;
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      parties, 
      addExpense, 
      addParty, 
      removeParty, 
      calculateSettlements 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}

export default function RootLayout() {
  return (
    <ExpenseProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'SplitIt',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-expense"
          options={{
            title: 'Add Expense',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="view-split"
          options={{
            title: 'View Split',
          }}
        />
        <Stack.Screen
          name="manage-parties"
          options={{
            title: 'Manage Parties',
          }}
        />
      </Stack>
    </ExpenseProvider>
  );
}

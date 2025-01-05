import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Expense } from '../types';

// Memory fallback for web platform
let webDb: {
  parties: string[];
  expenses: Expense[];
} = {
  parties: [],
  expenses: []
};

let db: SQLite.WebSQLDatabase | null = null;

const getDatabase = () => {
  if (Platform.OS === 'web') {
    return null;
  }
  if (!db) {
    db = SQLite.openDatabase('splitit.db');
  }
  return db;
};

export const initDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // No initialization needed for web memory storage
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(
      tx => {
        // Create parties table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS parties (
            name TEXT PRIMARY KEY
          );`
        );

        // Create expenses table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            paidBy TEXT NOT NULL,
            FOREIGN KEY (paidBy) REFERENCES parties (name)
          );`
        );

        // Create expense_shares table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS expense_shares (
            expense_id TEXT,
            party_name TEXT,
            PRIMARY KEY (expense_id, party_name),
            FOREIGN KEY (expense_id) REFERENCES expenses (id),
            FOREIGN KEY (party_name) REFERENCES parties (name)
          );`
        );
      },
      error => {
        console.error('Database initialization error:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

export const getParties = async (): Promise<string[]> => {
  if (Platform.OS === 'web') {
    return webDb.parties;
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(tx => {
      tx.executeSql(
        'SELECT name FROM parties ORDER BY name;',
        [],
        (_, { rows }) => {
          const parties: string[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            if (row) {
              parties.push(row.name);
            }
          }
          resolve(parties);
        },
        (_, error) => {
          console.error('Error getting parties:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addParty = async (name: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (!webDb.parties.includes(name)) {
      webDb.parties.push(name);
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(tx => {
      tx.executeSql(
        'INSERT INTO parties (name) VALUES (?);',
        [name],
        () => {
          resolve();
        },
        (_, error) => {
          console.error('Error adding party:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const removeParty = async (name: string): Promise<void> => {
  if (Platform.OS === 'web') {
    webDb.parties = webDb.parties.filter(p => p !== name);
    webDb.expenses = webDb.expenses.filter(e => e.paidBy !== name && !e.sharedBy.includes(name));
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(tx => {
      tx.executeSql(
        'DELETE FROM parties WHERE name = ?;',
        [name],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getExpenses = async (): Promise<Expense[]> => {
  if (Platform.OS === 'web') {
    return webDb.expenses;
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(tx => {
      tx.executeSql(
        `SELECT e.*, GROUP_CONCAT(es.party_name) as shared_by
         FROM expenses e
         LEFT JOIN expense_shares es ON e.id = es.expense_id
         GROUP BY e.id;`,
        [],
        (_, { rows }) => {
          const expenses: Expense[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            if (row) {
              expenses.push({
                id: row.id,
                description: row.description,
                amount: row.amount,
                paidBy: row.paidBy,
                sharedBy: row.shared_by ? row.shared_by.split(',') : []
              });
            }
          }
          resolve(expenses);
        },
        (_, error) => {
          console.error('Error getting expenses:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addExpense = async (expense: Expense): Promise<void> => {
  if (Platform.OS === 'web') {
    webDb.expenses.push({ ...expense });
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(tx => {
      tx.executeSql(
        'INSERT INTO expenses (id, description, amount, paidBy) VALUES (?, ?, ?, ?);',
        [expense.id, expense.description, expense.amount, expense.paidBy],
        () => {
          expense.sharedBy.forEach(party => {
            tx.executeSql(
              'INSERT INTO expense_shares (expense_id, party_name) VALUES (?, ?);',
              [expense.id, party]
            );
          });
          resolve();
        },
        (_, error) => {
          console.error('Error adding expense:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const editExpense = async (id: string, expense: Expense): Promise<void> => {
  if (Platform.OS === 'web') {
    const index = webDb.expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      webDb.expenses[index] = { ...expense };
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(tx => {
      tx.executeSql(
        'UPDATE expenses SET description = ?, amount = ?, paidBy = ? WHERE id = ?;',
        [expense.description, expense.amount, expense.paidBy, id],
        () => {
          tx.executeSql(
            'DELETE FROM expense_shares WHERE expense_id = ?;',
            [id],
            () => {
              expense.sharedBy.forEach(party => {
                tx.executeSql(
                  'INSERT INTO expense_shares (expense_id, party_name) VALUES (?, ?);',
                  [id, party]
                );
              });
              resolve();
            },
            (_, error) => {
              console.error('Error updating expense shares:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.error('Error updating expense:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const removeExpense = async (id: string): Promise<void> => {
  if (Platform.OS === 'web') {
    webDb.expenses = webDb.expenses.filter(e => e.id !== id);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const database = getDatabase();
    if (!database) {
      reject(new Error('Database not available'));
      return;
    }

    database.transaction(tx => {
      tx.executeSql(
        'DELETE FROM expense_shares WHERE expense_id = ?;',
        [id],
        () => {
          tx.executeSql(
            'DELETE FROM expenses WHERE id = ?;',
            [id],
            () => resolve(),
            (_, error) => {
              console.error('Error deleting expense:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.error('Error deleting expense shares:', error);
          reject(error);
          return false;
        }
      );
    });
  });
}; 
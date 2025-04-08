import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useExpenseStore = create((set, get) => ({
  groups: [],
  loadData: async () => {
    try {
      const savedGroups = await AsyncStorage.getItem("groups");
      if (savedGroups) {
        set({ groups: JSON.parse(savedGroups) });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  },
  addGroup: async (groupName, members) => {
    set((state) => {
      const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        expenses: [],
        members: members || ["You"],
      };
      const updatedGroups = [...state.groups, newGroup];
      AsyncStorage.setItem("groups", JSON.stringify(updatedGroups));
      return { groups: updatedGroups };
    });
  },
  deleteGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((group) => group.id !== groupId),
    })),
  addExpense: async (groupId, expense) => {
    set((state) => {
      const updatedGroups = state.groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            expenses: [
              ...group.expenses,
              {
                ...expense,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return group;
      });
      AsyncStorage.setItem("groups", JSON.stringify(updatedGroups));
      return { groups: updatedGroups };
    });
  },
  calculateOwedAmounts: (groupId) => {
    const { groups } = get();
    const group = groups.find((g) => g.id === groupId);
    if (!group) return {};

    const owedAmounts = {};
    group.members.forEach((member) => {
      owedAmounts[member] = 0;
    });

    group.expenses.forEach((expense) => {
      const totalAmount = Number(expense.amount);
      const payer = expense.payer;
      const splitType = expense.splitType;

      if (splitType === "equal") {
        const splitAmount = totalAmount / group.members.length;
        group.members.forEach((member) => {
          if (member !== payer) {
            owedAmounts[member] = (owedAmounts[member] || 0) + splitAmount;
          } else {
            owedAmounts[member] =
              (owedAmounts[member] || 0) - totalAmount + splitAmount;
          }
        });
      } else if (splitType === "custom" && expense.customSplit) {
        const totalSplit = Object.values(expense.customSplit).reduce(
          (sum, val) => sum + Number(val || 0),
          0
        );

        Object.entries(expense.customSplit).forEach(([member, amount]) => {
          const numericAmount = Number(amount || 0);
          if (member !== payer) {
            owedAmounts[member] =
              (owedAmounts[member] || 0) + numericAmount;
          } else {
            owedAmounts[member] =
              (owedAmounts[member] || 0) - (totalAmount - numericAmount);
          }
        });
      }
    });

    return owedAmounts;
  },
  getTotalOwedReceived: () => {
    const { groups } = get();
    let totalOwed = 0;
    let totalReceived = 0;

    groups.forEach((group) => {
      const owedAmounts = get().calculateOwedAmounts(group.id);
      Object.entries(owedAmounts).forEach(([member, amount]) => {
        if (member === "You") {
          if (amount > 0) totalOwed += amount;
          else if (amount < 0) totalReceived += Math.abs(amount);
        }
      });
    });

    return {
      totalOwed: Number((totalOwed || 0).toFixed(2)),
      totalReceived: Number((totalReceived || 0).toFixed(2)),
    };
  },
}));

export default useExpenseStore;

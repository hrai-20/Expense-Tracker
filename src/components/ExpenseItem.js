import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ExpenseItem({ expense }) {
  return (
    <View style={styles.container}>
      <View style={styles.expenseHeader}>
        <Ionicons name="document" size={20} color="#000" />
        <Text style={styles.title}>{expense.title}</Text>
      </View>
      <Text>Description: {expense.description}</Text>
      <Text>Category: {expense.category}</Text>
      <Text>Amount: ${expense.amount}</Text>
      <Text>Payer: {expense.payer}</Text>
      <Text>Date: {new Date(expense.timestamp).toLocaleDateString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  title: { fontWeight: "bold", marginLeft: 10, fontSize: 16 },
});

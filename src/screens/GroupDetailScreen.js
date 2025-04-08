import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-simple-toast";
import useExpenseStore from "../store/expenseStore";
import { Avatar } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { groups, addExpense, calculateOwedAmounts } = useExpenseStore();
  const group = groups.find((g) => g.id === groupId);

  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef(null);

  const [expense, setExpense] = useState({
    title: "",
    description: "",
    category: "",
    amount: "",
    splitType: "equal",
    payer: "You",
    customSplit: {},
  });
  const [customSplitAmounts, setCustomSplitAmounts] = useState({});
  const [errors, setErrors] = useState({ title: false, amount: false });

  const handleTabPress = (index) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setActiveTab(index);
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveTab(index);
  };

  const handleSplitChange = (member, value) => {
    setCustomSplitAmounts({ ...customSplitAmounts, [member]: value });
  };

  const handleAddExpense = () => {
    let hasErrors = false;

    if (!expense.title.trim()) {
      setErrors((prev) => ({ ...prev, title: true }));
      Toast.show("Title is required", Toast.SHORT);
      hasErrors = true;
    } else {
      setErrors((prev) => ({ ...prev, title: false }));
    }

    if (
      !expense.amount ||
      isNaN(parseFloat(expense.amount)) ||
      parseFloat(expense.amount) <= 0
    ) {
      setErrors((prev) => ({ ...prev, amount: true }));
      Toast.show("Amount must be a positive number", Toast.SHORT);
      hasErrors = true;
    } else {
      setErrors((prev) => ({ ...prev, amount: false }));
    }

    if (
      expense.splitType === "custom" &&
      Object.values(customSplitAmounts).reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
      ) !== parseFloat(expense.amount)
    ) {
      Toast.show("Custom split must equal total amount", Toast.SHORT);
      hasErrors = true;
    }

    if (hasErrors) return;

    addExpense(groupId, {
      ...expense,
      amount: parseFloat(expense.amount),
      customSplit: expense.splitType === "custom" ? customSplitAmounts : {},
    });

    setExpense({
      title: "",
      description: "",
      category: "",
      amount: "",
      splitType: "equal",
      payer: "You",
      customSplit: {},
    });
    setCustomSplitAmounts({});
    Toast.show("Expense added", Toast.SHORT);
  };

  const owedAmounts = calculateOwedAmounts(groupId);

  return (
    <LinearGradient colors={["#f5f7fa", "#c3cfe2"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>{group?.name}</Text>
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.tabRow}>
            {["Add Expense", "Expenses", "Summary"].map((label, index) => (
              <TouchableOpacity
                key={label}
                style={[styles.tabBtn, activeTab === index && styles.tabActive]}
                onPress={() => handleTabPress(index)}
              >
                <Text
                  style={
                    activeTab === index ? styles.tabTextActive : styles.tabText
                  }
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ flexGrow: 1 }}
            style={styles.tabScroll}
          >
            {/* Add Expense Tab */}
            <View style={styles.tabContent}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Add New Expense</Text>
                <TextInput
                  placeholder="Title"
                  value={expense.title}
                  onChangeText={(text) =>
                    setExpense({ ...expense, title: text })
                  }
                  style={[styles.input, errors.title && styles.errorInput]}
                />
                <TextInput
                  placeholder="Description"
                  value={expense.description}
                  onChangeText={(text) =>
                    setExpense({ ...expense, description: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  placeholder="Category"
                  value={expense.category}
                  onChangeText={(text) =>
                    setExpense({ ...expense, category: text })
                  }
                  style={styles.input}
                />
                <TextInput
                  placeholder="Amount"
                  keyboardType="numeric"
                  value={expense.amount}
                  onChangeText={(text) =>
                    setExpense({ ...expense, amount: text })
                  }
                  style={[styles.input, errors.amount && styles.errorInput]}
                />

                <Text style={styles.label}>Payer</Text>
                <Picker
                  selectedValue={expense.payer}
                  onValueChange={(value) =>
                    setExpense({ ...expense, payer: value })
                  }
                  style={styles.picker}
                >
                  {group?.members.map((member) => (
                    <Picker.Item key={member} label={member} value={member} />
                  ))}
                </Picker>

                <Text style={styles.label}>Split Type</Text>
                <Picker
                  selectedValue={expense.splitType}
                  onValueChange={(value) =>
                    setExpense({ ...expense, splitType: value })
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Equal" value="equal" />
                  <Picker.Item label="Custom" value="custom" />
                </Picker>

                {expense.splitType === "custom" && (
                  <View>
                    <Text style={[styles.label, { marginTop: 8 }]}>
                      Custom Split
                    </Text>
                    {group?.members.map((member) => (
                      <View key={member} style={styles.splitRow}>
                        <Text style={styles.memberName}>{member}</Text>
                        <TextInput
                          placeholder="Amount"
                          keyboardType="numeric"
                          value={customSplitAmounts[member] || ""}
                          onChangeText={(text) =>
                            handleSplitChange(member, text)
                          }
                          style={styles.splitInput}
                        />
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
                  <Text style={styles.addButtonText}>Add Expense</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expenses Tab */}
            <View style={styles.tabContent}>
              {group?.expenses.length > 0 ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>All Expenses</Text>
                  {group.expenses.map((exp) => (
                    <View key={exp.id} style={styles.expenseRow}>
                      <View style={styles.avatarRow}>
                        <Avatar.Text
                          size={36}
                          label={exp.payer.charAt(0)}
                          style={{ backgroundColor: "#4a90e2" }}
                        />
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.expenseTitle}>
                            {exp.title} - ${exp.amount}
                          </Text>
                          {exp.description && (
                            <Text style={styles.expenseSub}>
                              Desc: {exp.description}
                            </Text>
                          )}
                          {exp.category && (
                            <Text style={styles.expenseSub}>
                              Category: {exp.category}
                            </Text>
                          )}
                          <Text style={styles.expenseSub}>
                            Paid by: {exp.payer}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.card}>
                  <Text style={{ textAlign: "center", color: "#888" }}>
                    No expenses added yet.
                  </Text>
                </View>
              )}
            </View>

            {/* Summary Tab */}
            <View style={styles.tabContent}>
              {owedAmounts && Object.keys(owedAmounts).length > 0 ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Who Owes What</Text>
                  {Object.entries(owedAmounts).map(([member, amount]) => (
                    <Text key={member} style={styles.owedText}>
                      {member}:{" "}
                      {amount > 0
                        ? `Owes $${amount.toFixed(2)}`
                        : amount < 0
                        ? `Owed $${Math.abs(amount).toFixed(2)}`
                        : "Settled"}
                    </Text>
                  ))}
                </View>
              ) : (
                <View style={styles.card}>
                  <Text style={{ textAlign: "center", color: "#888" }}>
                    No summary data yet.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 30 },
  tabScroll: { flexGrow: 0 },
  tabContent: { width: screenWidth },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#4a90e2",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 10,
    marginBottom: 12,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e3e3e3",
  },
  tabActive: {
    backgroundColor: "#4a90e2",
  },
  tabText: {
    color: "#555",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  errorInput: {
    borderColor: "red",
  },
  label: {
    fontWeight: "500",
    marginBottom: 6,
    color: "#444",
  },
  picker: {
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  memberName: {
    flex: 1,
    color: "#333",
  },
  splitInput: {
    width: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f8f8f8",
  },
  addButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  expenseRow: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  expenseSub: {
    fontSize: 14,
    color: "#555",
  },
  owedText: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
});

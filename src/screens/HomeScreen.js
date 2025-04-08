import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useExpenseStore from "../store/expenseStore";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-simple-toast";

export default function HomeScreen({ navigation, onLogout }) {
  const {
    groups,
    addGroup,
    deleteGroup,
    loadData,
    getTotalOwedReceived,
  } = useExpenseStore();

  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState(["You"]);
  const [newMember, setNewMember] = useState("");

  const [groupNameError, setGroupNameError] = useState(false);
  const [newMemberError, setNewMemberError] = useState(false);

  const { totalOwed, totalReceived } = getTotalOwedReceived();

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMember = () => {
    if (!newMember.trim()) {
      Toast.show("Member name cannot be empty", Toast.LONG);
      setNewMemberError(true);
      return;
    }
    if (members.includes(newMember.trim())) {
      Toast.show("Member already exists", Toast.LONG);
      setNewMemberError(true);
      return;
    }
    setMembers([...members, newMember.trim()]);
    setNewMember("");
    setNewMemberError(false);
    Toast.show("Member added", Toast.SHORT);
  };

  const handleAddGroup = () => {
    if (!groupName.trim()) {
      Toast.show("Group name cannot be empty", Toast.LONG);
      setGroupNameError(true);
      return;
    }

    addGroup(groupName, members);
    setGroupName("");
    setMembers(["You"]);
    setGroupNameError(false);
    Toast.show("Group created", Toast.SHORT);
  };

  const handleDeleteGroup = (groupId) => {
    Alert.alert("Delete Group", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          deleteGroup(groupId);
          Toast.show("Group deleted", Toast.SHORT);
        },
        style: "destructive",
      },
    ]);
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate("GroupDetail", { groupId: item.id })}
    >
      <View style={styles.groupInfo}>
        <Ionicons name="people" size={24} color="#6d28d9" />
        <Text style={styles.groupName}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteGroup(item.id)}>
        <Ionicons name="trash" size={22} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#e0e7ff", "#f5f3ff"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Group Expenses</Text>
            <TouchableOpacity onPress={onLogout}>
              <Ionicons name="log-out-outline" size={26} color="#1e3a8a" />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              Owed: <Text style={styles.owed}>${totalOwed}</Text>
            </Text>
            <Text style={styles.summaryText}>
              Received: <Text style={styles.received}>${totalReceived}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create New Group</Text>
            <TextInput
              placeholder="Group Name"
              value={groupName}
              onChangeText={(text) => {
                setGroupName(text);
                if (groupNameError) setGroupNameError(false);
              }}
              style={[
                styles.input,
                groupNameError && styles.errorBorder,
              ]}
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.sectionTitle}>Members</Text>
            {members.map((member, i) => (
              <View key={i} style={styles.memberItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberName}>{member}</Text>
                {i > 0 && (
                  <TouchableOpacity
                    onPress={() =>
                      setMembers(members.filter((_, idx) => idx !== i))
                    }
                  >
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.memberInputRow}>
              <TextInput
                placeholder="Add Member"
                value={newMember}
                onChangeText={(text) => {
                  setNewMember(text);
                  if (newMemberError) setNewMemberError(false);
                }}
                style={[
                  styles.input,
                  { flex: 1, marginRight: 10 },
                  newMemberError && styles.errorBorder,
                ]}
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity onPress={handleAddMember}>
                <Ionicons name="person-add" size={26} color="#10b981" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddGroup}>
              <Text style={styles.addButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Groups</Text>
            <FlatList
              data={groups}
              renderItem={renderGroup}
              keyExtractor={(item) => item.id}
              style={{ flexGrow: 0 }}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  owed: {
    color: "#ef4444",
  },
  received: {
    color: "#10b981",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#4c1d95",
  },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    color: "#111827",
  },
  errorBorder: {
    borderWidth: 1.5,
    borderColor: "#ef4444",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginVertical: 10,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 10,
  },
  avatar: {
    backgroundColor: "#6366f1",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  memberInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  groupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 12,
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupName: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 10,
    fontWeight: "600",
  },
});

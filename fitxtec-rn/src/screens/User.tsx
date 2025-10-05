import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👤 User Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#9EFF00",
    fontSize: 22,
    fontWeight: "bold",
  },
});

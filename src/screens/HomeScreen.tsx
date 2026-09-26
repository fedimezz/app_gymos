import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "@/auth/AuthContext";

// Deliberately just a proof screen — real member/coach screens (schedule,
// bookings, roster, ...) come after the flow/design conversation. This
// exists to confirm end-to-end: club resolved → logged in → session
// restorable → role known.
export default function HomeScreen() {
  const { user, club, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connecté ✅</Text>
      <View style={styles.card}>
        <Row label="Salle" value={club?.name ?? "—"} />
        <Row label="Nom" value={user?.name ?? "—"} />
        <Row label="Email" value={user?.email ?? "—"} />
        <Row label="Rôle" value={user?.role ?? "—"} />
      </View>
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 80, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  card: { backgroundColor: "#f5f5f5", borderRadius: 12, padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  rowLabel: { color: "#888" },
  rowValue: { fontWeight: "600" },
  button: { marginTop: 24, padding: 16, alignItems: "center" },
  buttonText: { color: "#c0392b", fontWeight: "600" },
});

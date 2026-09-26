import { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { searchClubs } from "@/api/auth";
import type { ClubSearchResult } from "@/api/types";

// No onSelected/navigation prop needed: selectClub() updates AuthContext's
// `club`, and RootNavigator re-renders to LoginScreen on its own once that
// becomes non-null.
export default function ClubSearchScreen() {
  const { selectClub } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (text: string) => {
    setQuery(text);
    setError(null);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { clubs } = await searchClubs(text.trim());
      setResults(clubs);
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (club: ClubSearchResult) => {
    await selectClub(club);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trouvez votre salle</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom de la salle..."
        value={query}
        onChangeText={runSearch}
        autoFocus
        autoCapitalize="words"
      />

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.slug}
        style={{ marginTop: 12 }}
        renderItem={({ item }) => (
          <Pressable style={styles.result} onPress={() => handleSelect(item)}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultSlug}>{item.slug}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading && query.length >= 2 ? <Text style={styles.empty}>Aucune salle trouvée</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 80, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, fontSize: 16 },
  result: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f5", marginBottom: 8 },
  resultName: { fontSize: 16, fontWeight: "600" },
  resultSlug: { fontSize: 13, color: "#888", marginTop: 2 },
  empty: { textAlign: "center", color: "#999", marginTop: 24 },
  error: { color: "#c0392b", marginTop: 12 },
});

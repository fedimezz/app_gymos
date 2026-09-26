// Cross-platform key/value storage with the same async interface everywhere.
//
// expo-secure-store has NO web implementation — it wraps the iOS Keychain /
// Android Keystore, neither of which exists in a browser — so calling it on
// web throws at runtime (not caught by tsc or `expo export`, since neither
// actually executes the app's JS; this is only visible by really running it,
// which is exactly what happened during dev-loop testing here).
//
// The real target platform is phone-only (see BUILD_STATUS.md — no web
// version is shipped), so this isn't "hardening for production web"; it's
// just making the web preview usable as a fast dev-loop without a phone,
// which is the only reason web support exists in this project at all.
// localStorage has no OS-level encryption the way SecureStore does, but
// nothing sensitive needs to survive a browser tab used only for UI preview.
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore — e.g. private browsing with storage disabled */
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

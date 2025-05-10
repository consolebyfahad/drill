import { router, Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/config";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const loadSplash = async () => {
      router.push("/splash");
    };
    loadSplash();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Stack screenOptions={{ headerShown: false }} />
    </I18nextProvider>
  );
}

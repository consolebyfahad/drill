import { Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/config";
import { ToastProvider } from "~/components/ToastProvider";

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ToastProvider>
    </I18nextProvider>
  );
}

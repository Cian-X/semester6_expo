import { useRouter } from "expo-router";
import { useRef } from "react";
import { PanResponder } from "react-native";

const TABS = ["/(tabs)", "/(tabs)/education", "/(tabs)/activity", "/(tabs)/recipe"];
const TAB_NAMES = ["index", "education", "activity", "recipe"];

/**
 * Swipe kiri → tab berikutnya
 * Swipe kanan → tab sebelumnya
 */
export const useSwipeNavigate = (currentTabIndex: number) => {
  const router = useRouter();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Hanya aktif jika gerakan horizontal lebih dominan dari vertikal
        return (
          Math.abs(gestureState.dx) > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const SWIPE_THRESHOLD = 60;

        // Swipe kiri → tab berikutnya
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          const nextIndex = currentTabIndex + 1;
          if (nextIndex < TABS.length) {
            router.push(TABS[nextIndex] as any);
          }
        }
        // Swipe kanan → tab sebelumnya
        else if (gestureState.dx > SWIPE_THRESHOLD) {
          const prevIndex = currentTabIndex - 1;
          if (prevIndex >= 0) {
            router.push(TABS[prevIndex] as any);
          }
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
};

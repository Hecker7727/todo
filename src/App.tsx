import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { DataObjectRounded, DeleteForeverRounded } from "@mui/icons-material";
import { ThemeProvider as MuiThemeProvider, type Theme, CircularProgress } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./layouts/MainLayout";
import { CustomToaster } from "./components/Toaster";
import { defaultUser } from "./constants/defaultUser";
import { UserContext } from "./contexts/UserContext";
import { useSystemTheme } from "./hooks/useSystemTheme";
import AppRouter from "./router";
import { GlobalStyles } from "./styles";
import { Themes, createCustomTheme, isDarkMode } from "./theme/createTheme";
import { showToast } from "./utils";
import { GlobalQuickSaveHandler } from "./components/GlobalQuickSaveHandler";

function App() {
  const { user, setUser } = useContext(UserContext);
  const systemTheme = useSystemTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Initialize user properties if they are undefined
  const updateNestedProperties = useCallback(
    (userObject: any, defaultObject: any) => {
      if (!userObject) {
        return defaultObject;
      }

      Object.keys(defaultObject).forEach((key) => {
        if (key === "categories") {
          return;
        }
        if (
          key === "colorList" &&
          user?.colorList &&
          !defaultUser.colorList.every((element, index) => element === user.colorList[index])
        ) {
          return;
        }

        if (key === "settings" && Array.isArray(userObject.settings)) {
          delete userObject.settings;
          showToast("Removed old settings array format.", {
            duration: 6000,
            icon: <DeleteForeverRounded />,
            disableVibrate: true,
          });
        }

        const userValue = userObject[key];
        const defaultValue = defaultObject[key];

        if (typeof defaultValue === "object" && defaultValue !== null) {
          userObject[key] = updateNestedProperties(userValue, defaultValue);
        } else if (userValue === undefined) {
          userObject[key] = defaultValue;
          const valueToShow = userObject[key] !== null ? userObject[key].toString() : "null";
          showToast(
            <div>
              Added new property to user object{" "}
              <i translate="no">
                {key.toString()}: {valueToShow}
              </i>
            </div>,
            {
              duration: 6000,
              icon: <DataObjectRounded />,
              disableVibrate: true,
            },
          );
        }
      });

      return userObject;
    },
    [user?.colorList],
  );

  useEffect(() => {
    try {
      setUser((prevUser) => {
        const updatedUser = updateNestedProperties({ ...prevUser }, defaultUser);
        return prevUser !== updatedUser ? updatedUser : prevUser;
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing user:", error);
      setIsLoading(false);
    }
  }, [setUser, user?.colorList, updateNestedProperties]);

  useEffect(() => {
    const setBadge = async (count: number) => {
      if ("setAppBadge" in navigator) {
        try {
          await navigator.setAppBadge(count);
        } catch (error) {
          console.error("Failed to set app badge:", error);
        }
      }
    };

    const clearBadge = async () => {
      if ("clearAppBadge" in navigator) {
        try {
          await navigator.clearAppBadge();
        } catch (error) {
          console.error("Failed to clear app badge:", error);
        }
      }
    };

    const displayAppBadge = async () => {
      if (user?.settings?.appBadge) {
        if ((await Notification.requestPermission()) === "granted") {
          const incompleteTasksCount = user?.tasks?.filter((task) => !task.done).length ?? 0;
          if (!isNaN(incompleteTasksCount)) {
            setBadge(incompleteTasksCount);
          }
        }
      } else {
        clearBadge();
      }
    };

    if ("setAppBadge" in navigator) {
      displayAppBadge();
    }
  }, [user?.settings?.appBadge, user?.tasks]);

  // Wait for system theme to be detected
  useEffect(() => {
    if (systemTheme !== "unknown") {
      setIsThemeReady(true);
    }
  }, [systemTheme]);

  const getMuiTheme = useCallback((): Theme => {
    if (systemTheme === "unknown") {
      return Themes[0].MuiTheme;
    }
    if (user?.theme === "system") {
      return systemTheme === "dark" ? Themes[0].MuiTheme : Themes[1].MuiTheme;
    }
    const selectedTheme = Themes.find((theme) => theme.name === user?.theme);
    return selectedTheme ? selectedTheme.MuiTheme : Themes[0].MuiTheme;
  }, [systemTheme, user?.theme]);

  useEffect(() => {
    const themeColorMeta = document.querySelector("meta[name=theme-color]");
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", getMuiTheme().palette.secondary.main);
    }
  }, [user?.theme, getMuiTheme]);

  if (isLoading || !isThemeReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#ffffff'
      }}>
        <CircularProgress />
      </div>
    );
  }

  const currentTheme = getMuiTheme();
  const isDark = isDarkMode(user?.darkmode || "auto", systemTheme, currentTheme.palette.secondary.main);

  return (
    <MuiThemeProvider
      theme={createCustomTheme(
        currentTheme.palette.primary.main,
        currentTheme.palette.secondary.main,
        isDark ? "dark" : "light",
      )}
    >
      <EmotionThemeProvider
        theme={{
          primary: currentTheme.palette.primary.main,
          secondary: currentTheme.palette.secondary.main,
          darkmode: isDark,
          mui: currentTheme,
        }}
      >
        <GlobalStyles />
        <CustomToaster />
        <ErrorBoundary>
          <MainLayout>
            <GlobalQuickSaveHandler>
              <AppRouter />
            </GlobalQuickSaveHandler>
          </MainLayout>
        </ErrorBoundary>
      </EmotionThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;

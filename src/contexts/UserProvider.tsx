import { defaultUser } from "../constants/defaultUser";
import { useStorageState } from "../hooks/useStorageState";
import { User } from "../types/user";
import { UserContext } from "./UserContext";
import { useEffect } from "react";

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useStorageState<User>(defaultUser, "user");

  // Ensure default categories are always present
  useEffect(() => {
    if (!user.categories || user.categories.length === 0) {
      setUser((prevUser) => ({
        ...prevUser,
        categories: defaultUser.categories,
      }));
    }
  }, [user.categories, setUser]);

  // const updateUser = <K extends keyof User>(
  //   updater: (prevUser: User) => Pick<User, K> | Partial<User>,
  // ): void => {
  //   setUser((prevUser) => ({
  //     ...prevUser,
  //     ...updater(prevUser),
  //   }));
  // };

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

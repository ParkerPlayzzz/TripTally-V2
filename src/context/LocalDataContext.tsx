import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import logger from "@/lib/logger";

export type Task = {
  id: string;
  title: string;
  description?: string;
  date: string;
  tripId?: string;
  start_time?: string;
  end_time?: string;
  priority?: string;
  color?: string;
  category?: string;
  subtasks?: { title: string; completed: false | true }[];
  completed: boolean;
  createdAt: string;
};

export type Trip = {
  id: string;
  name: string;
  destinations: string[];
  start_date: string;
  end_date: string;
  total_budget: number;
  home_currency: string;
  status: string;
  notes?: string;
  createdAt: string;
};

export type WishlistItem = {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  planned_budget: number;
  currency: string;
  color?: string;
  trip_id?: string;
  subcategories?: string[];
  createdAt: string;
};

export type Purchase = {
  id: string;
  trip_id?: string;
  item_name: string;
  store_name?: string;
  date: string;
  amount: number;
  original_currency: string;
  converted_amount?: number;
  home_currency?: string;
  exchange_rate?: number;
  quantity?: number;
  subcategory?: string;
  category_id?: string;
  city?: string;
  notes?: string;
  payment_method?: string;
  createdAt: string;
};

type LocalDataContextType = {
  trips: Trip[];
  tasks: Task[];
  categories: Category[];
  purchases: Purchase[];
  wishlist: WishlistItem[];
  transparency: number;
  addTrip: (trip: Omit<Trip, "id" | "createdAt">) => void;
  updateTrip: (id: string, changes: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addCategory: (cat: Omit<Category, "id" | "createdAt">) => void;
  updateCategory: (id: string, changes: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addPurchase: (p: Omit<Purchase, "id" | "createdAt">) => void;
  updatePurchase: (id: string, changes: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  addWishlist: (item: Omit<WishlistItem, "id" | "createdAt">) => void;
  updateWishlist: (id: string, changes: Partial<WishlistItem>) => void;
  deleteWishlist: (id: string) => void;
  setTransparency: (value: number) => void;
  userName?: string | null;
  setUserName: (name: string | null) => void;
};

const KEY_TRIPS = "triptally:trips";
const KEY_TASKS = "triptally:tasks";
const KEY_WISHLIST = "triptally:wishlist";
const KEY_TRANSPARENCY = "triptally:transparency";
const KEY_CATEGORIES = "triptally:categories";
const KEY_PURCHASES = "triptally:purchases";
const KEY_USER = "triptally:user";

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const makeId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

export const LocalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => loadJSON(KEY_TRIPS, []));
  const [tasks, setTasks] = useState<Task[]>(() => loadJSON(KEY_TASKS, []));
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => loadJSON(KEY_WISHLIST, []));
  const [transparency, setTransparencyState] = useState<number>(() => loadJSON(KEY_TRANSPARENCY, 0.5));
  const [categories, setCategories] = useState<Category[]>(() => loadJSON(KEY_CATEGORIES, []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadJSON(KEY_PURCHASES, []));
  const [userName, setUserNameState] = useState<string | null>(() => loadJSON(KEY_USER, null));

  useEffect(() => saveJSON(KEY_TRIPS, trips), [trips]);
  useEffect(() => saveJSON(KEY_TASKS, tasks), [tasks]);
  useEffect(() => saveJSON(KEY_WISHLIST, wishlist), [wishlist]);
  useEffect(() => saveJSON(KEY_TRANSPARENCY, transparency), [transparency]);
  useEffect(() => saveJSON(KEY_CATEGORIES, categories), [categories]);
  useEffect(() => saveJSON(KEY_PURCHASES, purchases), [purchases]);
  useEffect(() => saveJSON(KEY_USER, userName), [userName]);

  const addTrip = (trip: Omit<Trip, "id" | "createdAt">) => {
    setTrips((current) => [
      { ...trip, id: makeId("trip"), createdAt: new Date().toISOString() },
      ...current,
    ]);
  };

  const updateTrip = (id: string, changes: Partial<Trip>) => {
    setTrips((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const deleteTrip = (id: string) => {
    setTrips((current) => current.filter((item) => item.id !== id));
    setTasks((current) => current.filter((task) => task.tripId !== id));
    setCategories((current) => current.filter((c) => c.trip_id !== id));
    setPurchases((current) => current.filter((p) => p.trip_id !== id));
  };

  const addCategory = (cat: Omit<Category, "id" | "createdAt">) => {
    setCategories((current) => [ { ...cat, id: makeId("cat"), createdAt: new Date().toISOString() }, ...current ]);
  };

  const updateCategory = (id: string, changes: Partial<Category>) => {
    setCategories((current) => current.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((current) => current.filter((c) => c.id !== id));
    setPurchases((current) => current.map((p) => (p.category_id === id ? { ...p, category_id: undefined } : p)));
  };

  const addPurchase = (p: Omit<Purchase, "id" | "createdAt">) => {
    setPurchases((current) => [ { ...p, id: makeId("pur"), createdAt: new Date().toISOString() }, ...current ]);
  };

  const updatePurchase = (id: string, changes: Partial<Purchase>) => {
    setPurchases((current) => current.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  };

  const deletePurchase = (id: string) => {
    setPurchases((current) => current.filter((p) => p.id !== id));
  };

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    logger.debug("LocalDataContext.addTask - incoming", task);
    setTasks((current) => {
      const next = [
        {
          ...task,
          id: makeId("task"),
          createdAt: new Date().toISOString(),
          completed: task.completed ?? false,
        },
        ...current,
      ];
      logger.debug("LocalDataContext.addTask - next", next);
      return next;
    });
  };

  const updateTask = (id: string, changes: Partial<Task>) => {
    logger.debug("LocalDataContext.updateTask", id, changes);
    setTasks((current) => {
      const next = current.map((task) => (task.id === id ? { ...task, ...changes } : task));
      logger.debug("LocalDataContext.updateTask - next", next);
      return next;
    });
  };

  const toggleTask = (id: string) => {
    logger.debug("LocalDataContext.toggleTask", id);
    setTasks((current) => {
      const next = current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
      logger.debug("LocalDataContext.toggleTask - next", next);
      return next;
    });
  };

  const deleteTask = (id: string) => {
    logger.debug("LocalDataContext.deleteTask", id);
    setTasks((current) => {
      const next = current.filter((task) => task.id !== id);
      logger.debug("LocalDataContext.deleteTask - next", next);
      return next;
    });
  };

  const addWishlist = (item: Omit<WishlistItem, "id" | "createdAt">) => {
    setWishlist((current) => [
      { ...item, id: makeId("wish"), createdAt: new Date().toISOString() },
      ...current,
    ]);
  };

  const updateWishlist = (id: string, changes: Partial<WishlistItem>) => {
    setWishlist((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const deleteWishlist = (id: string) => {
    setWishlist((current) => current.filter((item) => item.id !== id));
  };

  const setTransparency = (value: number) => {
    setTransparencyState(value);
  };

  const setUserName = (name: string | null) => {
    setUserNameState(name);
  };

  const value = useMemo(
    () => ({
      trips,
      tasks,
      categories,
      purchases,
      wishlist,
      transparency,
      addTrip,
      updateTrip,
      deleteTrip,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      addCategory,
      updateCategory,
      deleteCategory,
      addPurchase,
      updatePurchase,
      deletePurchase,
      addWishlist,
      updateWishlist,
      deleteWishlist,
      setTransparency,
      userName,
      setUserName,
    }),
    [trips, tasks, categories, purchases, wishlist, transparency, userName],
  );

  return <LocalDataContext.Provider value={value}>{children}</LocalDataContext.Provider>;
};

export const useLocalData = () => {
  const context = useContext(LocalDataContext);
  if (!context) throw new Error("useLocalData must be used inside LocalDataProvider");
  return context;
};
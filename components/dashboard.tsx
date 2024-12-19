"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import AuthForm from "@/components/auth-form";
import Link from "next/link";

export default function Dashboard() {
  const [habitData, setHabitData] = useState({
    date: new Date().toISOString(),
    sleep: "",
    calories: "",
    exercise: "",
    water: "",
  });
  const [percentages, setPercentages] = useState({
    sleep: 0,
    calories: 0,
    exercise: 0,
    water: 0,
  });
  const [tips, setTips] = useState("");
  const [habits, setHabits] = useState<
    {
      date: string;
      sleep: string;
      calories: string;
      exercise: string;
      water: string;
    }[]
  >([]);

  const [token, setToken] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token]);

  useEffect(() => {
    if (habits.length > 1) {
      const latest = habits[habits.length - 1];
      const previous = habits[habits.length - 2];

      setPercentages({
        sleep: calculatePercentageChange(latest.sleep, previous.sleep),
        calories: calculatePercentageChange(latest.calories, previous.calories),
        exercise: calculatePercentageChange(latest.exercise, previous.exercise),
        water: calculatePercentageChange(latest.water, previous.water),
      });
    }
  }, [habits]);

  useEffect(() => {
    const tk = localStorage.getItem("token");
    if (tk) {
      setToken(tk);
    }
  }, []);

  if (!token) return <AuthForm setToken={setToken} />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const logHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(habitData),
      });
      if (!response.ok) throw new Error("Failed to log habit");
      await fetchHabits();
      setHabitData({
        date: new Date().toISOString(),
        sleep: "",
        calories: "",
        exercise: "",
        water: "",
      });
      toast({ title: "Habit logged successfully" });
    } catch (error) {
      toast({
        title: "Error logging habit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch habits");
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      toast({
        title: "Error fetching habits",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getHealthTips = async () => {
    const simplifiedHabits = habits.map((habit) => ({
      sleep: habit.sleep,
      calories: habit.calories,
      exercise: habit.exercise,
      water: habit.water,
    }));

    const prompt = `Based on the following habits, provide personalized health tips:\nSleep: ${simplifiedHabits
      .map((habit) => habit.sleep)
      .join(", ")}\nCalories: ${simplifiedHabits
      .map((habit) => habit.calories)
      .join(", ")}\nExercise: ${simplifiedHabits
      .map((habit) => habit.exercise)
      .join(", ")}\nWater: ${simplifiedHabits
      .map((habit) => habit.water)
      .join(", ")}`;

    const response = await fetch("/api/healthTips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    setTips(data.tips);
  };

  return (
    <div className="flex min-h-screen flex-col px-6">
      <header className="sticky px-8 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                TrackIt
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground"
                href="/"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button
                variant="ghost"
                className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
              >
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLogout}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1">
        <div className="container grid items-start mx-auto gap-6 pb-8 pt-6 md:py-10">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Track your daily habits and get personalized health tips.
            </p>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {habits[habits.length - 1]?.sleep || 0} hrs
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {percentages.sleep.toFixed(2)}% from last entry
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Calories
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M18 20V10" />
                      <path d="M12 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {habits[habits.length - 1]?.calories || 0} cals
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {percentages.calories.toFixed(2)}% from last entry
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Exercise
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 12v.01" />
                      <path d="M19.071 4.929a10 10 0 0 1 0 14.142" />
                      <path d="M4.929 4.929a10 10 0 0 0 0 14.142" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {habits[habits.length - 1]?.exercise || 0} min
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {percentages.exercise.toFixed(2)}% from last entry
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Water</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v6" />
                      <path d="M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10" />
                      <path d="M20 10a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {habits[habits.length - 1]?.water || 0} glasses
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {percentages.water.toFixed(2)}% from last entry
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={habits}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          strokeOpacity={0.2}
                        />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                        <Line
                          type="monotone"
                          dataKey="sleep"
                          stroke="#EE6C4D"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="calories"
                          stroke="#82ca9d"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="exercise"
                          stroke="#ffc658"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="water"
                          stroke="#0273CD"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-4 md:col-span-3 w-full">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      You have logged {habits.length} habits this week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {habits
                        .slice(-5)
                        .reverse()
                        .map((habit, index) => (
                          <div
                            key={index}
                            className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                          >
                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Logged habits for{" "}
                                {new Date(habit.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Sleep: {habit.sleep}hrs, Calories:{" "}
                                {habit.calories}, Exercise: {habit.exercise}min,
                                Water: {habit.water} glasses
                              </p>
                            </div>
                          </div>
                        ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
                <Card className="col-span-4 md:col-span-8">
                  <CardHeader className="flex flex-row justify-between gap-8 items-center">
                  <div>
                    <CardTitle>Health Tips</CardTitle>
                    <CardDescription>
                      Personalized tips based on your habits
                    </CardDescription>
                    </div>
                     <Button className="!m-0" onClick={getHealthTips}>Get New Tips</Button>
                  </CardHeader>
                 {tips && <CardContent>
                    <pre className="text-sm text-muted-foreground text-wrap font-sans">
                      {tips.trim()}
                    </pre>
                  </CardContent>}
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="habits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Log Your Daily Habits</CardTitle>
                  <CardDescription>
                    Enter your daily habits to track your progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={logHabit} className="space-y-4">
                    <div className="flex flex-wrap gap-4 items-center jsutify-between w-full">
                      {Object.entries({
                      sleep: "Sleep (hours)",
                      calories: "Calories (cals)",
                      exercise: "Exercise (minutes)",
                      water: "Water (glasses)",
                      }).map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                        {label}
                        </label>
                        <div className="flex items-center space-x-2">
                        <Input
                          className="!text-4xl font-bold p-2 py-8 max-w-[200px] w-fit"
                          id={key}
                          type="number"
                          value={habitData[key]}
                          onChange={(e) =>
                          setHabitData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                          }
                        />
                        </div>
                      </div>
                      ))}
                    </div>
                    <Button type="submit">Log Habits</Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Habit Trends</CardTitle>
                  <CardDescription>
                    Your habit progress over the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={habits.slice(-7)}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        strokeOpacity={0.2}
                      />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomHabitLegend />} />
                      <Bar dataKey="sleep" fill="#EE6C4D" />
                      <Bar dataKey="exercise" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-black p-3 border border-gray-200/10 px-4 rounded-2xl shadow-lg">
        <p className="label font-bold text-xl">{`${new Date(
          label
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })}`}</p>
        <p className="intro">{`Sleep: ${payload[0].value} hrs`}</p>
        {payload[2] && (
          <p className="intro">{`Calories: ${payload[1].value}`}</p>
        )}
        <p className="intro">{`Exercise: ${
          payload[2] ? payload[2].value : payload[1].value
        } min`}</p>
        {payload[2] && (
          <p className="intro">{`Water: ${payload[3].value} glasses`}</p>
        )}
      </div>
    );
  }
  return null;
};

const CustomLegend = () => {
  return (
    <div className="custom-legend flex gap-2 justify-center mt-2 -mb-4 w-full items-center">
      <div className="flex items-center text-sm font-bold text-black space-x-2 px-3 py-1 bg-[#EE6C4D] rounded-lg">
        Sleep
      </div>
      <div className="flex items-center text-sm font-bold text-black space-x-2 px-3 py-1 bg-[#82ca9d] rounded-lg">
        Calories
      </div>
      <div className="flex items-center text-sm font-bold text-black space-x-2 px-3 py-1 bg-[#ffc658] rounded-lg">
        Exercise
      </div>
      <div className="flex items-center text-sm font-bold text-black space-x-2 px-3 py-1 bg-[#0273CD] rounded-lg">
        Water
      </div>
    </div>
  );
};

const CustomHabitLegend = () => {
  return (
    <div className="custom-legend flex gap-2 justify-center mt-2 -mb-4 w-full items-center">
      <div className="flex items-center text-sm font-bold text-black space-x-2 px-3 py-1 bg-[#EE6C4D] rounded-lg">
        Sleep
      </div>
      <div className="flex items-center text-sm font-bold text-black space-x-2 px-3 py-1 bg-[#ffc658] rounded-lg">
        Exercise
      </div>
    </div>
  );
};

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return 100; // Avoid division by zero
  return ((current - previous) / previous) * 100;
};

import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const habits = ["Water", "Sleep", "Screen Time"];
const initialProgress = habits.reduce((acc, h) => ({ ...acc, [h]: 0 }), {});

const Dashboard = () => {
  const [progress, setProgress] = useState(initialProgress);
  const [streak, setStreak] = useState(0);
  const [log, setLog] = useState([]);
  const [selectedView, setSelectedView] = useState("dashboard");
  const [message, setMessage] = useState("");
  const [goals, setGoals] = useState({ Water: 80, Sleep: 90, "Screen Time": 50 });
  const [reminder, setReminder] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [flashBg, setFlashBg] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const complete = Object.entries(progress).every(
      ([key, val]) => val >= goals[key]
    );
    if (complete) {
      setStreak((prev) => prev + 1);
      setReminderEnabled(false); // disable reminder if goals are met
    }
  }, [progress, goals]);

  useEffect(() => {
    let interval;
    if (reminderEnabled) {
      interval = setInterval(() => {
        setReminder("⏰ Don't forget to log your habits today!");
        setFlashBg(true);
        if (audioRef.current) {
          audioRef.current.play();
        }
        setTimeout(() => {
          setReminder("");
          setFlashBg(false);
        }, 4000);
      }, 10000); // every 10 seconds
    }
    return () => clearInterval(interval);
  }, [reminderEnabled]);

  const handleChange = (habit, value) => {
    setProgress({ ...progress, [habit]: value });
  };

  const handleGoalChange = (habit, value) => {
    setGoals({ ...goals, [habit]: value });
  };

  const logToday = () => {
    const entry = { date: new Date().toLocaleDateString(), ...progress };
    setLog([...log.slice(-6), entry]);
    setProgress(initialProgress);
    setMessage("✅ Progress logged for today!");
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleReminder = () => {
    setReminderEnabled((prev) => !prev);
  };

  const navItems = ["dashboard", "log", "settings"];

  return (
    <div className={`min-h-screen ${flashBg ? "bg-yellow-100" : "bg-gradient-to-br from-indigo-50 to-blue-100"} text-gray-800 transition-colors duration-500 font-sans`}> 
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto" />

      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-wide text-indigo-700">Habit Tracker</h1>
        <nav className="space-x-4">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setSelectedView(item)}
              className={`capitalize px-4 py-2 rounded-lg font-medium transition ${
                selectedView === item ? "bg-indigo-600 text-white" : "text-indigo-600 hover:bg-indigo-100"}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-6 md:p-8">
        {selectedView === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-3xl font-bold mb-6 text-indigo-700">Daily Check-In</h2>
            <div className="space-y-5">
              {habits.map((habit) => (
                <div key={habit} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <label className="font-medium text-lg text-gray-700 w-32">{habit}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress[habit]}
                    onChange={(e) => handleChange(habit, Number(e.target.value))}
                    className="w-full md:w-3/4 accent-indigo-500"
                  />
                  <span className="text-right font-semibold w-12">{progress[habit]}%</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={logToday}
                className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
              >
                Log Today
              </button>
              <div className="text-lg font-medium">🔥 Streak: <strong>{streak}</strong> days</div>
            </div>
            {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
            {reminder && <p className="mt-2 text-yellow-600 italic font-medium">{reminder}</p>}
          </motion.div>
        )}

        {selectedView === "log" && (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-3xl font-bold mb-6 text-indigo-700">Weekly Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={log}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                {habits.map((habit, i) => (
                  <Line key={habit} type="monotone" dataKey={habit} stroke={`hsl(${i * 100}, 70%, 50%)`} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {selectedView === "settings" && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-3xl font-bold mb-6 text-indigo-700">Settings & Goals</h2>
            <div className="space-y-5 mb-6">
              {habits.map((habit) => (
                <div key={habit} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <label className="font-medium text-lg text-gray-700 w-44">Goal for {habit}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goals[habit]}
                    onChange={(e) => handleGoalChange(habit, Number(e.target.value))}
                    className="border px-3 py-1.5 rounded-md w-24 focus:outline-indigo-500"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              ))}
            </div>
            <button
              onClick={toggleReminder}
              className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
                reminderEnabled ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {reminderEnabled ? "Disable Reminder" : "Enable Reminder"}
            </button>
          </motion.div>
        )}
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        © 2025 <span className="font-semibold text-indigo-600">Tanmay Garg</span> — Habit Tracker
      </footer>
    </div>
  );
};

export default Dashboard;

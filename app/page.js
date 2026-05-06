"use client";

import { useState, useEffect } from "react";
import { Car } from "lucide-react";
import TripForm from "./components/TripForm";
import PassengerTable from "./components/PassengerTable";
import Result from "./components/Result";
import ShareBar from "./components/ShareBar";
import { calculateSplit } from "./utils/calc";
import { encodeTrip, decodeTrip } from "./utils/encode";

export default function Home() {
  const [distance, setDistance] = useState(351);
  const [fuel, setFuel] = useState(50);
  const [toll, setToll] = useState(14);
  const [passengers, setPassengers] = useState([]);
  const [result, setResult] = useState({});

  useEffect(() => {
    const data = decodeTrip();
    if (data.distance) setDistance(data.distance);
    if (data.fuel) setFuel(data.fuel);
    if (data.toll) setToll(data.toll);
    if (data.passengers.length) setPassengers(data.passengers);
  }, []);

  useEffect(() => {
    setResult(calculateSplit(distance, fuel, toll, passengers));
  }, [distance, fuel, toll, passengers]);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + encodeTrip({ distance, fuel, toll, passengers })
      : "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-violet-100 py-10 px-5">
      <div className="max-w-[480px] mx-auto">

        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white mb-4 shadow-xl shadow-indigo-300/40 ring-4 ring-indigo-100">
            <Car className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Carpool Split</h1>
          <p className="text-sm text-slate-400 mt-2">Split trip costs fairly, share instantly</p>
        </header>

        <TripForm
          distance={distance}
          setDistance={setDistance}
          fuel={fuel}
          setFuel={setFuel}
          toll={toll}
          setToll={setToll}
        />

        <PassengerTable passengers={passengers} setPassengers={setPassengers} />

        <Result result={result} />

        <ShareBar url={shareUrl} />

      </div>
    </main>
  );
}

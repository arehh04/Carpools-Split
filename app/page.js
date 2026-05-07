"use client";

import { useState, useEffect } from "react";
import { Cpu } from "lucide-react";
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
  const [driverName, setDriverName] = useState(null);
  const [result, setResult] = useState({});

  useEffect(() => {
    const data = decodeTrip();
    if (data.distance) setDistance(data.distance);
    if (data.fuel) setFuel(data.fuel);
    if (data.toll) setToll(data.toll);
    if (data.passengers.length) setPassengers(data.passengers);
    if (data.driverName != null) setDriverName(data.driverName);
  }, []);

  useEffect(() => {
    setResult(calculateSplit(distance, fuel, toll, passengers, driverName));
  }, [distance, fuel, toll, passengers, driverName]);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + encodeTrip({ distance, fuel, toll, passengers, driverName })
      : "";

  return (
    <main
      className="min-h-screen py-10 px-5 bg-[#070F34]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="max-w-[480px] mx-auto">

        <header className="text-center mb-10">
          {/* Icon — cut-corner HUD box */}
          <div className="inline-flex items-center justify-center mb-5">
            <div
              className="w-16 h-16 border-2 border-[#00E5FF] bg-[#0d1525] flex items-center justify-center"
              style={{
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                boxShadow: "0 0 20px rgba(0,229,255,0.25), inset 0 0 20px rgba(0,229,255,0.05)",
              }}
            >
              <Cpu
                className="w-7 h-7 text-[#00E5FF]"
                style={{ filter: "drop-shadow(0 0 6px #00E5FF)" }}
              />
            </div>
          </div>

          <h1
            className="font-orbitron text-2xl font-black text-[#00E5FF] mb-2"
            style={{ textShadow: "0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(0,229,255,0.2)" }}
          >
            CARPOOL//SPLIT
          </h1>

          <p className="text-[10px] text-[#00E5FF]/40 tracking-[0.3em] uppercase">
            Trip Cost Distribution System
          </p>

          {/* Decorative HUD data strip */}
          <div className="mt-4 flex items-center justify-center gap-3 text-[9px] text-[#00E5FF]/20 tracking-widest">
            <span>SYS:ACTIVE</span>
            <span className="w-1 h-1 rounded-full bg-[#00E5FF]/30 inline-block" />
            <span>NET:STABLE</span>
            <span className="w-1 h-1 rounded-full bg-[#00E5FF]/30 inline-block" />
            <span>VER:2.0</span>
          </div>
        </header>

        <TripForm
          distance={distance}
          setDistance={setDistance}
          fuel={fuel}
          setFuel={setFuel}
          toll={toll}
          setToll={setToll}
        />

        <PassengerTable
          passengers={passengers}
          setPassengers={setPassengers}
          driverName={driverName}
          setDriverName={setDriverName}
          distance={distance}
        />

        <Result result={result} />

        <ShareBar url={shareUrl} />

      </div>
    </main>
  );
}

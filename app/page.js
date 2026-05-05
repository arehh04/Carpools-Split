"use client";

import { useState, useEffect } from "react";
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

  const [passengers, setPassengers] = useState([
    { name: "Ali", start: 0, end: 351 },
    { name: "Abu", start: 0, end: 351 },
    { name: "Ahmad", start: 0, end: 160 },
  ]);

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
      ? window.location.origin +
        encodeTrip({ distance, fuel, toll, passengers })
      : "";

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">🚗 Carpool Dashboard</h1>

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

      <ShareBar url={shareUrl} result={result} />
    </main>
  );
}

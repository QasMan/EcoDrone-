// Demo/simulation data for when backend is not connected

const wasteTypes = [
  { result: "Plastic Bottle", confidence: 94, valid: true, points: 10 },
  { result: "Aluminum Can", confidence: 89, valid: true, points: 15 },
  { result: "Paper Bag", confidence: 91, valid: true, points: 5 },
  { result: "Glass Jar", confidence: 87, valid: true, points: 12 },
  { result: "Cardboard Box", confidence: 93, valid: true, points: 8 },
  { result: "Food Waste", confidence: 78, valid: false, points: 0 },
  { result: "Organic Material", confidence: 72, valid: false, points: 0 },
];

export function simulateAIDetection() {
  const randomWaste = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
  return new Promise((resolve) => {
    setTimeout(() => resolve(randomWaste), 1500);
  });
}

export function simulateDroneDispatch(location, qrCode) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        drone_id: "ECO-DRONE-" + Math.floor(Math.random() * 100).toString().padStart(3, "0"),
        status: "dispatched",
        eta_minutes: Math.floor(Math.random() * 10) + 3,
        battery_level: Math.floor(Math.random() * 30) + 70,
      });
    }, 1000);
  });
}

const droneStatuses = [
  "dispatched",
  "en_route",
  "arrived",
  "qr_verified",
  "collecting",
  "returning",
  "delivered",
];

export function simulateDroneStatusUpdates(callback) {
  let idx = 0;
  const interval = setInterval(() => {
    if (idx >= droneStatuses.length) {
      clearInterval(interval);
      return;
    }
    callback({
      status: droneStatuses[idx],
      eta_minutes: Math.max(0, 8 - idx * 1.5),
      battery_level: 95 - idx * 3,
    });
    idx++;
  }, 3000);
  
  return () => clearInterval(interval);
}

export function generateQRCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "ECO-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function simulateChatResponse(message) {
  const responses = {
    plastic: "Yes! Plastic bottles, containers, and bags can often be recycled. Look for the recycling symbol (♻️) and the number inside it. Numbers 1 (PET) and 2 (HDPE) are the most commonly recycled plastics.",
    recycle: "Recycling is the process of converting waste materials into new materials. Common recyclable items include paper, cardboard, glass, metal cans, and certain plastics.",
    drone: "EcoDrone+ uses autonomous drones to collect recyclable waste from designated drop points. Our drones are equipped with QR scanners to verify waste packages.",
    points: "You earn EcoPoints for each valid waste item you submit. Points vary by material type: Plastic (10pts), Aluminum (15pts), Glass (12pts), Paper (5pts), Cardboard (8pts).",
    default: "I'm your EcoDrone+ AI assistant! I can help you with recycling questions, waste sorting, and using the app. Try asking about specific materials or how the drone system works.",
  };

  const key = Object.keys(responses).find(k => 
    message.toLowerCase().includes(k)
  ) || "default";

  return new Promise((resolve) => {
    setTimeout(() => resolve(responses[key]), 800);
  });
}
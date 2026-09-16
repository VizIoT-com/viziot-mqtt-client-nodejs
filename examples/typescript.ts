// TypeScript example. For plain JavaScript (CommonJS) see examples/javascript.cjs —
// the API is identical, only the import syntax and types differ.
import { VizIoTMQTT } from 'viziot-mqtt-client-nodejs';

// Get these two values from your device's page on https://viziot.com
const DEVICE_KEY = '________________';
const DEVICE_PASSWORD = '____________________';

// How often we send data to the server, in milliseconds.
const SEND_INTERVAL_MS = 60_000;

// Toggled remotely from the VizIoT.com dashboard via the "sendTestData" parameter/switch.
let sendTestData: string | number = 1;
let sendIntervalId: NodeJS.Timeout | undefined;

const client = new VizIoTMQTT(DEVICE_KEY, DEVICE_PASSWORD);

// --- Connection lifecycle -------------------------------------------------
// These events are optional to listen to, but "error" should always be handled:
// Node.js crashes the process if an EventEmitter emits "error" with no listener attached.

client.on('connect', () => {
  console.log('Connected to the VizIoT.com broker.');
});

client.on('reconnect', () => {
  console.log('Connection lost, trying to reconnect...');
});

client.on('close', () => {
  console.log('Connection closed.');
});

client.on('offline', () => {
  console.log('Client is offline (no network / broker unreachable).');
});

client.on('error', (error) => {
  console.error('MQTT error:', error.message);
});

// --- Helpers ---------------------------------------------------------------

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendDataToServer(): Promise<void> {
  if (!sendTestData) return; // sending is switched off from the dashboard

  const packet = {
    date: Math.floor(Date.now() / 1000),
    testData: getRandomInt(1, 100),
    sendTestData,
  };

  try {
    await client.send(packet);
    console.log('Sent:', packet);
  } catch (error) {
    console.error('Failed to send data:', (error as Error).message);
  }
}

async function shutdown(): Promise<void> {
  console.log('\nShutting down...');
  clearInterval(sendIntervalId);
  await client.disconnect();
  process.exit(0);
}

// --- Entry point -------------------------------------------------------------

async function main(): Promise<void> {
  await client.connect(); // waits for the first successful connection, throws if it fails

  // Whenever the user flips the "sendTestData" switch on VizIoT.com, we get a command here.
  await client.onCommand((parameter, value) => {
    if (parameter === 'sendTestData') {
      sendTestData = value;
      console.log('Command received: sendTestData =', value);
    }
  });

  sendIntervalId = setInterval(sendDataToServer, SEND_INTERVAL_MS);

  // Stop cleanly on Ctrl+C instead of just killing the process.
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Failed to connect:', (error as Error).message);
  process.exit(1);
});

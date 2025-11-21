import { useState } from "react";

function ArduinoPage() {
  const [port, setPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  async function connectSerial() {
    try {
      // User klik connect => pilih port
      const selectedPort = await (navigator as any).serial.requestPort();

      // open serial (baudRate harus sama dengan Arduino)
      await selectedPort.open({ baudRate: 9600 });

      setPort(selectedPort);

      // Setup text decoder
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = selectedPort.readable.pipeTo(
        textDecoder.writable
      );
      const textReader = textDecoder.readable.getReader();

      setReader(textReader);

      // Mulai baca loop
      readLoop(textReader);

      setLogs((prev) => [...prev, "CONNECTED to Arduino"]);
    } catch (err) {
      console.error(err);
      setLogs((prev) => [...prev, "Connection FAILED"]);
    }
  }

  async function readLoop(textReader: any) {
    while (true) {
      const { value, done } = await textReader.read();
      if (done) break;
      if (value) {
        setLogs((prev) => [...prev, "Arduino:", value]);
      }
    }
  }

  async function sendBytes(byteArray: number[]) {
    if (!port) return alert("Not connected");

    const writer = port.writable.getWriter();
    const data = new Uint8Array(byteArray);
    await writer.write(data);
    writer.releaseLock();
  }

  async function sendCommand(msg: string) {
    if (!port) return alert("Not connected");

    const textEncoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.write(textEncoder.encode(msg));
    writer.releaseLock();
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Arduino Serial (React PWA)</h2>

      <button onClick={connectSerial} className="btn">
        Connect
      </button>

      <br />
      <br />

      <button onClick={() => sendCommand("ON")}>Send ON</button>
      <button onClick={() => sendCommand("OFF")}>Send OFF</button>
      <button onClick={() => sendBytes([184])}>Enable Channel (184)</button>
      <button onClick={() => sendBytes([185])}>Disable Channel (185)</button>
      <button onClick={() => sendBytes([186])}>Accept Cash (186)</button>

      <h3>Logs:</h3>
      <div
        style={{
          background: "#eee",
          padding: 10,
          height: 200,
          overflowY: "auto",
        }}
      >
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}

export default ArduinoPage;

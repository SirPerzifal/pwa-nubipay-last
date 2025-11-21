import React, { createContext, useContext, useState, ReactNode } from "react";

interface SerialContextType {
  port: any;
  reader: any;
  writer: any;
  logs: string[];
  isConnected: boolean;
  connectToDevice: () => Promise<boolean>;
  sendBytes: (byteArray: number[]) => Promise<void>;
}

const SerialContext = createContext<SerialContextType | undefined>(undefined);

export const SerialProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [port, setPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [writer, setWriter] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // ⛔ STREAM CLEANUP FIX
  const cleanupStreams = async (p: any) => {
    try {
      if (reader) {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
        setReader(null);
      }

      if (writer) {
        writer.releaseLock();
        setWriter(null);
      }

      if (p?.readable?.locked) {
        // tidak ada release untuk readable
      }
      if (p?.writable?.locked) {
        // tidak ada release untuk writable
      }
    } catch (_) {}
  };

  // 🚀 SUPER SAFE CONNECT
  const connectToDevice = async (): Promise<boolean> => {
    try {
      let selectedPort = port;

      // (1) Jika sudah connect → jangan init ulang
      if (isConnected && port && reader && writer) {
        // console.log("Already connected");
        return true;
      }

      // (2) Ambil paired port
      if (!selectedPort) {
        const ports = await (navigator as any).serial.getPorts();
        selectedPort = ports.length
          ? ports[0]
          : await (navigator as any).serial.requestPort();
        setPort(selectedPort);
      }

      // (3) Cleanup sebelum open (penting!)
      await cleanupStreams(selectedPort);

      // (4) Open tanpa error meskipun sudah open
      try {
        await selectedPort.open({ baudRate: 9600 });
      } catch (err: any) {
        if (err.name === "InvalidStateError") {
          // console.log("Port already open, skipping open()");
        } else {
          throw err;
        }
      }

      // (5) BUILD DECODER STREAM
      const decoder = new TextDecoderStream();

      // Hindari pipeTo jika stream sudah locked
      if (!selectedPort.readable.locked) {
        selectedPort.readable.pipeTo(decoder.writable).catch(() => {});
      }

      // (6) GET READER
      const textReader = decoder.readable.getReader();
      setReader(textReader);

      // (7) GET WRITER
      if (!selectedPort.writable.locked) {
        const textWriter = selectedPort.writable.getWriter();
        setWriter(textWriter);
      } else {
        console.log("Writable already locked → skip getWriter");
      }

      // (8) Read loop hanya sekali
      (async () => {
        while (true) {
          const { value, done } = await textReader.read();
          if (done) break;
          if (value) {
            setLogs((prev) => [...prev, "Arduino: " + value]);
          }
        }
      })();

      setIsConnected(true);
      setLogs((p) => [...p, "Connected OK"]);
      return true;
    } catch (e) {
      console.error("Connection error:", e);
      setLogs((prev) => [...prev, "Connection FAILED"]);
      setIsConnected(false);
      return false;
    }
  };

  // 📤 SEND BYTES
  const sendBytes = async (byteArray: number[]) => {
    if (!writer || !isConnected) {
      console.warn("Writer not available or not connected");
      return;
    }

    try {
      const data = new Uint8Array(byteArray);
      // console.log(`Sending bytes: ${data}`);
      await writer.write(data);
      // console.log(`Sent: ${byteArray.join(", ")}`);
      // console.log(writer.write(data));
      setLogs((p) => [...p, `Sent: ${byteArray.join(", ")}`]);
    } catch (e) {
      console.error("Send error:", e);
    }
  };

  return (
    <SerialContext.Provider
      value={{
        port,
        reader,
        writer,
        logs,
        isConnected,
        connectToDevice,
        sendBytes,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};

export const useSerial = () => {
  const ctx = useContext(SerialContext);
  if (!ctx) throw new Error("useSerial must be used inside SerialProvider");
  return ctx;
};

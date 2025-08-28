// Полный полифилл Buffer/Process для браузера
import './polyfills';
import { Buffer } from 'buffer';
import process from 'process';

// Подкидываем в глобальную область, если их нет
if (!(window as any).Buffer) (window as any).Buffer = Buffer;
if (!(window as any).process) (window as any).process = process;

  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  
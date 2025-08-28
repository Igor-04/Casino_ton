import { Buffer } from 'buffer';
import process from 'process';

if (!(window as any).Buffer) (window as any).Buffer = Buffer;
if (!(window as any).process) (window as any).process = process;

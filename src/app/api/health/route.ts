import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      app: 'Clasy ABES Timetable & Notes',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.2.0',
    },
    { status: 200 }
  );
}

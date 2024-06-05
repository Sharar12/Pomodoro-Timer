import Pomodoro from '@/pomodoro/page';

export default function Home(){
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Pomodoro Timer</h1>
      <Pomodoro/>
    </main>
  );
}

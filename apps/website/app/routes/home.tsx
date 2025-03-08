import { useState } from 'react';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  const [access, setAccess] = useState<'signIn' | 'signUp'>('signIn');

  function signUp(formData: FormData) {
    fetch(`${import.meta.env.VITE_BACKEND_URL!}/auth/signUp`, {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
  }

  function signIn(formData: FormData) {
    fetch(`${import.meta.env.VITE_BACKEND_URL!}/auth/signIn`, {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-gray-200">
      <div className="w-full flex-col gap-4 h-full items-center justify-center flex">
        <h1 className="text-black">OAuth example</h1>
        {access === 'signIn' ? (
          <form action={signIn} className="flex flex-col gap-4 min-w-1/4">
            <input
              required
              autoComplete="off"
              name="email"
              type="email"
              className="bg-gray-400 rounded-lg shadow-2xl py-1 px-2"
            />
            <input
              required
              autoComplete="off"
              name="password"
              type="password"
              className="bg-gray-400 rounded-lg shadow-2xl py-1 px-2"
            />
            <button className="bg-green-300 hover:bg-green-400 transition-all py-1 rounded-lg text-black cursor-pointer">
              Sign in
            </button>

            <div onClick={() => setAccess('signUp')} className="cursor-pointer">
              <p>Don't have an account? Sign Up</p>
            </div>
          </form>
        ) : (
          <form action={signUp} className="flex flex-col gap-4 min-w-1/4">
            <input
              required
              autoComplete="off"
              name="email"
              type="email"
              className="bg-gray-400 rounded-lg shadow-2xl py-1 px-2"
            />
            <input
              required
              autoComplete="off"
              name="password"
              type="password"
              className="bg-gray-400 rounded-lg shadow-2xl py-1 px-2"
            />
            <button className="bg-green-300 hover:bg-green-400 transition-all py-1 rounded-lg text-black cursor-pointer">
              Sign up
            </button>
            <div onClick={() => setAccess('signIn')} className="cursor-pointer">
              <p>Already have an account? Sign In</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

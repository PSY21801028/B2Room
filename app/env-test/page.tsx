"use client";

export default function EnvTestPage() {
  console.log("✅ SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("✅ SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10));

  return (
    <div className="p-10">
      <h1>Env Test Page</h1>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p>KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10)}...</p>
    </div>
  );
}

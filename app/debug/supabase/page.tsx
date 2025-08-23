import { createClient } from "@/utils/supabase/server";

interface CategoryRow {
  id: number;
  name: string;
  created_at: string;
}

export default async function SupabaseDebugPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("furniture_categories")
    .select("id, name, created_at")
    .limit(5);

  const categories = (data ?? []) as CategoryRow[];

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Supabase 연결 상태</h1>

      {error ? (
        <div className="text-red-400">
          <p className="font-medium">연결 실패</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      ) : (
        <div>
          <p className="text-green-400 font-medium">연결 성공</p>
          <p className="text-sm text-neutral-400 mt-1">
            furniture_categories 상위 {categories.length}개 레코드
          </p>

          <div className="mt-4 space-y-2">
            {categories.length === 0 ? (
              <p className="text-neutral-400">표시할 데이터가 없습니다.</p>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="border border-neutral-800 rounded px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-neutral-400">#{c.id}</span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}



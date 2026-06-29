import { supabase } from "./supabase";

export type Project = {
  id: string;
  title: string;
  blurb: string;
  url: string;
  repo: string;
  cover: string;
  cover_id: string | null;
  tags: string[];
  category: string;
  status: "live" | "wip" | "archived";
  pos: number;
  created_at: string;
};

export type ProjectInput = Omit<Project, "id" | "created_at">;

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("pos", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p) => ({ ...p, tags: p.tags ?? [] }));
}

export async function addProject(p: ProjectInput): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert(p).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, p: Partial<ProjectInput>): Promise<Project> {
  const { data, error } = await supabase.from("projects").update(p).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function removeProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

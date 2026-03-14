import { api } from './client';
import type { Task, Project, RoomMessage, Report, ReportJob, Agent } from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function verifyApiKey(baseUrl: string, apiKey: string): Promise<boolean> {
  try {
    await api.get('/tasks?limit=1', { baseUrl, apiKey });
    return true;
  } catch {
    return false;
  }
}

export async function registerHuman(name: string): Promise<Agent> {
  return api.post<Agent>('/auth/register-human', { name });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function fetchTasks(params?: {
  status?: string;
  limit?: number;
  parent_id?: string;
}): Promise<Task[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.parent_id) q.set('parent_id', params.parent_id);
  const qs = q.toString();
  return api.get<Task[]>(`/tasks${qs ? '?' + qs : ''}`);
}

export async function fetchTask(id: string): Promise<Task> {
  return api.get<Task>(`/tasks/${id}`);
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  return api.post<Task>('/tasks', data);
}

export async function approveTask(id: string): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}/approve`);
}

export async function rejectTask(id: string, note: string): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}/reject`, { review_note: note });
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  return api.get<Project[]>('/projects');
}

// ── Room messages ─────────────────────────────────────────────────────────────

export async function fetchRoomMessages(
  roomId: string,
  params?: { limit?: number; since?: string; before?: string },
): Promise<RoomMessage[]> {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.since) q.set('since', params.since);
  if (params?.before) q.set('before', params.before);
  const qs = q.toString();
  return api.get<RoomMessage[]>(`/rooms/${roomId}/messages${qs ? '?' + qs : ''}`);
}

export async function postRoomMessage(
  roomId: string,
  senderAgentId: string,
  content: string,
): Promise<RoomMessage> {
  return api.post<RoomMessage>(`/rooms/${roomId}/messages`, {
    sender_agent_id: senderAgentId,
    content,
  });
}

export async function fetchRoomId(): Promise<string> {
  const rooms = await api.get<{ id: string }[]>('/rooms');
  if (!rooms || rooms.length === 0) throw new Error('No rooms');
  return rooms[0].id;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function fetchReportJobs(): Promise<ReportJob[]> {
  return api.get<ReportJob[]>('/report-jobs');
}

export async function fetchReports(jobId: string): Promise<Report[]> {
  return api.get<Report[]>(`/report-jobs/${jobId}/reports`);
}

export async function fetchRooms() { return api.get("/rooms"); }

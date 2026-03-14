export interface Agent {
  id: string;
  name: string;
  type?: string;
  owner_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'assigned' | 'running' | 'review' | 'done' | 'rejected';
  priority?: number;
  assigned_agent_id?: string;
  project_id?: string;
  task_type?: 'epic' | 'story' | 'task';
  parent_task_id?: string;
  user_story?: string;
  acceptance_criteria?: string[];
  required_capabilities?: string[];
  result?: string;
  review_note?: string;
  guidance?: string;
  acceptance_criteria_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  sender_agent_id: string;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DMMessage {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  payload: { text: string };
  created_at: string;
}

export interface Report {
  id: string;
  job_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface ReportJob {
  id: string;
  title: string;
  description?: string;
  agent_id: string;
  cron_expr?: string;
  created_at: string;
}

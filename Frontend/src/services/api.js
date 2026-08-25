const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiService {
  constructor(baseUrl = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setBaseUrl(url) {
    this.baseUrl = (url || DEFAULT_API_BASE).replace(/\/$/, '');
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async checkHealth() {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.baseUrl}/`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - startTime);
      if (res.ok) {
        return { online: true, latency, error: null };
      }
      return { online: false, latency, error: `HTTP ${res.status}` };
    } catch (err) {
      return { online: false, latency: null, error: err.message };
    }
  }

  async getDashboard() {
    const res = await fetch(`${this.baseUrl}/api/dashboard`);
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard stats: HTTP ${res.status}`);
    }
    return await res.json();
  }

  async createAssessment(payload) {
    const res = await fetch(`${this.baseUrl}/api/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Assessment creation failed: HTTP ${res.status}`);
    }
    return await res.json();
  }

  async streamAssessment(payload, onEvent) {
    const res = await fetch(`${this.baseUrl}/api/assessments/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Streaming assessment failed: HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalResult = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (!jsonStr) continue;
          try {
            const eventData = JSON.parse(jsonStr);
            if (eventData.event === 'error') {
              throw new Error(eventData.error || 'Pipeline execution failed');
            }
            if (onEvent) {
              onEvent(eventData);
            }
            if (eventData.event === 'complete') {
              finalResult = eventData.assessment;
            }
          } catch (e) {
            console.error('Failed to parse SSE chunk:', e, jsonStr);
          }
        }
      }
    }

    if (buffer.trim().startsWith('data:')) {
      const jsonStr = buffer.trim().replace(/^data:\s*/, '');
      if (jsonStr) {
        try {
          const eventData = JSON.parse(jsonStr);
          if (onEvent) onEvent(eventData);
          if (eventData.event === 'complete') finalResult = eventData.assessment;
        } catch (e) {
          console.error('Failed to parse trailing SSE buffer:', e);
        }
      }
    }

    return finalResult;
  }

  async getAssessmentById(id) {
    const res = await fetch(`${this.baseUrl}/api/assessments/${encodeURIComponent(id)}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Failed to fetch assessment ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  }

  async updateVerification(id, status) {
    const res = await fetch(`${this.baseUrl}/api/verification/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Failed to update verification: HTTP ${res.status}`);
    }
    return await res.json();
  }

  async getAuditLogs(limit = 50) {
    try {
      const res = await fetch(`${this.baseUrl}/api/audit-logs?limit=${limit}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
}

export const api = new ApiService();


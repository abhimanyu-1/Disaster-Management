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

  async downloadReport(assessment, format = 'pdf') {
    const res = await fetch(`${this.baseUrl}/api/assessments/report?format=${encodeURIComponent(format)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessment),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Report download failed: HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const filename = format === 'pdf' 
      ? `Disaster_Assessment_${assessment.assessment_id}.pdf`
      : format === 'json'
      ? `Disaster_Assessment_${assessment.assessment_id}.json`
      : `Disaster_Assessment_${assessment.assessment_id}.md`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}

export const api = new ApiService();


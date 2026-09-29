import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey?: string;
  simplified?: boolean;
  style?: string;
  avatarUrls?: { [key: string]: string };
  description?: any;
  [key: string]: any;
}

export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type?: string;
  status?: string;
  homepageId?: string;
  [key: string]: any;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: any;
    issuetype?: { id: string; name: string; iconUrl?: string };
    status?: { id: string; name: string; statusCategory?: any };
    priority?: { id: string; name: string; iconUrl?: string };
    assignee?: { accountId: string; displayName: string; emailAddress?: string; avatarUrls?: any };
    reporter?: { accountId: string; displayName: string; emailAddress?: string };
    created?: string;
    updated?: string;
    duedate?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class JiraserviceService {
  private readonly baseUrl = '/api/jira';
  private readonly directProxyUrl = '/jira';

  constructor(private http: HttpClient) {}

  // ==========================================
  // PROJECTS
  // ==========================================

  /**
   * Fetches all Jira projects from the backend.
   * @param params Optional query parameters (e.g. { maxResults: 100, orderBy: 'name' })
   */
  getProjects(params?: { [param: string]: string | number | boolean }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/projects`, { params: httpParams });
  }

  /**
   * Fetches a single Jira project by its ID or Key.
   * @param idOrKey Project ID or Project Key (e.g. 'EMP' or '10099')
   */
  getProjectByIdOrKey(idOrKey: string): Observable<JiraProject> {
    return this.http.get<JiraProject>(`${this.baseUrl}/projects/${idOrKey}`);
  }

  // ==========================================
  // CONFLUENCE SPACES
  // ==========================================

  /**
   * Fetches Confluence spaces from the backend.
   * @param params Optional query parameters (e.g. { limit: 50, sort: 'name' })
   */
  getSpaces(params?: { [param: string]: string | number | boolean }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/spaces`, { params: httpParams });
  }

  // ==========================================
  // ISSUES / TICKETS
  // ==========================================

  /**
   * Searches and retrieves issues using JQL query.
   * @param jql JQL query string (e.g. "project = EMP ORDER BY created DESC")
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of issues to return
   */
  getIssues(jql: string = '', startAt: number = 0, maxResults: number = 50): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/issues/search`, {
      jql,
      startAt,
      maxResults
    });
  }

  /**
   * Fetches issues for a specific Jira project.
   * @param projectKey Jira project key (e.g. 'EMP', 'SMS')
   * @param maxResults Maximum number of issues to retrieve
   */
  getIssuesByProject(projectKey: string, maxResults: number = 50): Observable<any> {
    const jql = `project = ${projectKey} ORDER BY created DESC`;
    return this.getIssues(jql, 0, maxResults);
  }

  /**
   * Fetches sprints for a Jira board.
   * @param boardId Jira Agile board ID (default: '100')
   */
  getSprints(boardId: string = '100'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sprints`, {
      params: { boardId }
    });
  }

  /**
   * Fetches single Jira issue by ID or Key.
   * @param issueIdOrKey Issue ID or Key (e.g. 'EMP-1', '10100')
   */
  getIssueById(issueIdOrKey: string): Observable<JiraIssue> {
    return this.http.get<JiraIssue>(`${this.baseUrl}/issues/${issueIdOrKey}`);
  }

  /**
   * Creates a new issue in Jira.
   * @param issueData Issue payload matching Jira REST API v3 schema
   */
  createIssue(issueData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/issues`, issueData);
  }

  /**
   * Updates an existing issue in Jira.
   * @param issueIdOrKey Issue ID or Key
   * @param issueData Fields/data to update
   */
  updateIssue(issueIdOrKey: string, issueData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/issues/${issueIdOrKey}`, issueData);
  }

  /**
   * Deletes an issue from Jira.
   * @param issueIdOrKey Issue ID or Key
   */
  deleteIssue(issueIdOrKey: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/issues/${issueIdOrKey}`);
  }

  // ==========================================
  // USERS & PROFILE
  // ==========================================

  /**
   * Gets the authenticated Jira user profile (myself).
   */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/myself`);
  }

  /**
   * Fetches assignable users for a project or issue.
   * @param projectKey Project key (e.g. 'EMP')
   * @param query Search query string
   */
  getAssignableUsers(projectKey?: string, query?: string): Observable<any[]> {
    let httpParams = new HttpParams();
    if (projectKey) {
      httpParams = httpParams.set('project', projectKey);
    }
    if (query) {
      httpParams = httpParams.set('query', query);
    }

    return this.http.get<any[]>(`${this.baseUrl}/users/assignable`, { params: httpParams });
  }

  // ==========================================
  // HELPER UTILITIES
  // ==========================================

  /**
   * Helper utility to extract readable plain text from Jira's Atlassian Document Format (ADF) description.
   * @param description String or Atlassian Document Format JSON object
   */
  extractDescriptionText(description: any): string {
    if (!description) {
      return '';
    }

    if (typeof description === 'string') {
      return description;
    }

    const textParts: string[] = [];

    const visit = (node: any): void => {
      if (Array.isArray(node)) {
        node.forEach(visit);
      } else if (node && typeof node === 'object') {
        if (node.type === 'text' && node.text) {
          textParts.push(node.text);
        }
        if (node.content) {
          visit(node.content);
        }
      }
    };

    visit(description);
    return textParts.join(' ').trim();
  }
}

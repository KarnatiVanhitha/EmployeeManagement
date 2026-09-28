const getAuthHeaders = (useConfluenceCredentials = false) => {
    const email = useConfluenceCredentials
        ? (process.env.CONFLUENCE_EMAIL || process.env.JIRA_EMAIL)
        : (process.env.JIRA_EMAIL || process.env.CONFLUENCE_EMAIL);
    const token = useConfluenceCredentials
        ? (process.env.CONFLUENCE_API_TOKEN || process.env.JIRA_API_TOKEN)
        : (process.env.JIRA_API_TOKEN || process.env.CONFLUENCE_API_TOKEN);
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    if (email && token) {
        const credentials = Buffer.from(`${email}:${token}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
    }

    return headers;
};

const getJiraHost = () => {
    return process.env.JIRA_HOST || 'https://karnativanhitha.atlassian.net';
};

const sendSafeResponse = async (fetchRes, res) => {
    const contentType = fetchRes.headers.get('content-type') || '';
    if (fetchRes.status === 204) {
        return res.status(200).json({ message: 'Operation successful' });
    }

    if (contentType.includes('application/json')) {
        const data = await fetchRes.json();
        return res.status(fetchRes.status).json(data);
    } else {
        const text = await fetchRes.text();
        if (!fetchRes.ok) {
            return res.status(fetchRes.status).json({
                message: 'Atlassian API returned non-JSON response or service unavailable',
                status: fetchRes.status
            });
        }
        return res.status(fetchRes.status).send(text);
    }
};

// ==========================================
// 1. GET JIRA PROJECTS
// ==========================================
exports.getProjects = async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const host = getJiraHost();
        const url = `${host}/rest/api/3/project/search${query ? `?${query}` : ''}`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Jira projects:', error);
        res.status(502).json({ message: 'Unable to fetch Jira projects', error: error.message });
    }
};

// ==========================================
// 2. GET SINGLE PROJECT BY ID OR KEY
// ==========================================
exports.getProjectById = async (req, res) => {
    try {
        const { idOrKey } = req.params;
        const host = getJiraHost();
        const url = `${host}/rest/api/3/project/${idOrKey}`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Jira project by ID/Key:', error);
        res.status(502).json({ message: 'Unable to fetch Jira project', error: error.message });
    }
};

// ==========================================
// 3. GET JIRA ISSUE TYPES
// ==========================================
exports.getIssueTypes = async (req, res) => {
    try {
        const host = getJiraHost();
        const url = `${host}/rest/api/3/issuetype`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Jira issue types:', error);
        res.status(502).json({ message: 'Unable to fetch Jira issue types', error: error.message });
    }
};

// ==========================================
// 4. GET CONFLUENCE SPACES
// ==========================================
exports.getSpaces = async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const host = getJiraHost();
        const url = `${host}/wiki/api/v2/spaces${query ? `?${query}` : ''}`;
        const headers = getAuthHeaders(true);

        const response = await fetch(url, { headers });
        if (response.status === 401 || response.status === 403 || response.status === 404) {
            return res.status(200).json({ values: [] });
        }
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Confluence spaces:', error);
        res.status(200).json({ values: [] });
    }
};

// ==========================================
// 4. GET BOARDS FOR A PROJECT
// ==========================================
exports.getBoards = async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const host = getJiraHost();
        const url = `${host}/rest/agile/1.0/board${query ? `?${query}` : ''}`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Jira boards:', error);
        res.status(502).json({ message: 'Unable to fetch Jira boards', error: error.message });
    }
};

// ==========================================
// 5. GET BOARD SPRINTS
// ==========================================
exports.getSprints = async (req, res) => {
    try {
        const boardId = req.query.boardId || req.params.boardId || 100;
        const host = getJiraHost();
        const url = `${host}/rest/agile/1.0/board/${boardId}/sprint`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Jira sprints:', error);
        res.status(502).json({ message: 'Unable to fetch Jira sprints', error: error.message });
    }
};

// ==========================================
// 5. SEARCH / GET ISSUES
// ==========================================
exports.getIssues = async (req, res) => {
    try {
        const host = getJiraHost();
        const headers = getAuthHeaders();
        let jql = (req.body?.jql || req.query?.jql || '').trim();
        const maxResults = req.body?.maxResults || req.query?.maxResults || 50;
        const nextPageToken = req.body?.nextPageToken || req.query?.nextPageToken;

        // If no search restriction given, default to all non-null issues
        if (!jql) {
            jql = 'project is not EMPTY';
        }

        const url = `${host}/rest/api/3/search/jql`;
        const payload = {
            jql,
            maxResults: Number(maxResults),
            fields: [
                'summary',
                'issuetype',
                'description',
                'priority',
                'status',
                'assignee',
                'duedate',
                'parent',
                'project',
                'timespent',
                'timeoriginalestimate',
                'timeestimate',
                'worklog'
            ]
        };

        if (nextPageToken) {
            payload.nextPageToken = nextPageToken;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error searching Jira issues:', error);
        res.status(502).json({ message: 'Unable to search Jira issues', error: error.message });
    }
};

// ==========================================
// 5. GET SINGLE ISSUE
// ==========================================
exports.getIssueById = async (req, res) => {
    try {
        const { issueIdOrKey } = req.params;
        const host = getJiraHost();
        const url = `${host}/rest/api/3/issue/${issueIdOrKey}`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Jira issue:', error);
        res.status(502).json({ message: 'Unable to fetch Jira issue', error: error.message });
    }
};

// ==========================================
// 6. CREATE ISSUE
// ==========================================
exports.createIssue = async (req, res) => {
    try {
        const host = getJiraHost();
        const url = `${host}/rest/api/3/issue`;
        const headers = getAuthHeaders();

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(req.body)
        });

        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error creating Jira issue:', error);
        res.status(502).json({ message: 'Unable to create Jira issue', error: error.message });
    }
};

// ==========================================
// 7. UPDATE ISSUE
// ==========================================
exports.updateIssue = async (req, res) => {
    try {
        const { issueIdOrKey } = req.params;
        const host = getJiraHost();
        const url = `${host}/rest/api/3/issue/${issueIdOrKey}`;
        const headers = getAuthHeaders();

        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(req.body)
        });

        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error updating Jira issue:', error);
        res.status(502).json({ message: 'Unable to update Jira issue', error: error.message });
    }
};

// ==========================================
// 8. DELETE ISSUE
// ==========================================
exports.deleteIssue = async (req, res) => {
    try {
        const { issueIdOrKey } = req.params;
        const host = getJiraHost();
        const url = `${host}/rest/api/3/issue/${issueIdOrKey}`;
        const headers = getAuthHeaders();

        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });

        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error deleting Jira issue:', error);
        res.status(502).json({ message: 'Unable to delete Jira issue', error: error.message });
    }
};

// ==========================================
// 9. GET AUTHENTICATED USER (MYSELF)
// ==========================================
exports.getMyself = async (req, res) => {
    try {
        const host = getJiraHost();
        const url = `${host}/rest/api/3/myself`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching Jira current user profile:', error);
        res.status(502).json({ message: 'Unable to fetch Jira user profile', error: error.message });
    }
};

// ==========================================
// 10. GET USERS / ASSIGNABLE USERS
// ==========================================
exports.getAssignableUsers = async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const host = getJiraHost();
        const url = `${host}/rest/api/3/user/assignable/search${query ? `?${query}` : ''}`;
        const headers = getAuthHeaders();

        const response = await fetch(url, { headers });
        await sendSafeResponse(response, res);
    } catch (error) {
        console.error('Error fetching assignable Jira users:', error);
        res.status(502).json({ message: 'Unable to fetch assignable Jira users', error: error.message });
    }
};

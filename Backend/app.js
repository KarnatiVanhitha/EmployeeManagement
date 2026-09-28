const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

const employeeRoutes = require("./Routes/EmployeeRoute");
const roleRoutes = require("./Routes/RoleRoute");
const departmentRoutes = require("./Routes/DepartmentRoute");
const adminRoute = require("./Routes/AdminRoute");
const teamManagerRoutes = require("./Routes/TeamManagerRoute");
const salaryRoutes = require("./Routes/SalaryRoute");
const leaveRoutes = require("./Routes/LeaveRoute");
const projectRoutes = require("./Routes/ProjectRoute");
const taskRoutes = require("./Routes/TaskRoute");
const reviewRoutes = require("./Routes/ReviewRoute");
const calendarRoutes = require("./Routes/CalendarRoute");
const timesheetRoutes = require("./Routes/TimesheetRoute");
const useCaseRoutes = require('./Routes/UsecaseRoute');
const sprintRoutes = require('./Routes/SprintRoute');
const jiraRoutes = require('./Routes/JiraRoute');

// Table init functions (must run AFTER connectDB)
const { initCalendarTables } = require("./Models/CalendarModel");
const { initTimesheetTable } = require("./Models/TimesheetModel");
const { initUseCaseTable } = require("./Models/UseCaseModel");
const { initSprintTable } = require("./Models/SprintModel");
const { initProjectsTable } = require("./Models/ProjectModel");
const { initTaskTable } = require("./Models/TaskModel");
const { initRoleTable } = require("./Models/RoleModel");

const app = express();

app.use(cors());

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));


app.use("/api/managers", teamManagerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/admins", adminRoute);
app.use("/api/salaries", salaryRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use('/api/usecases', useCaseRoutes);
app.use('/api/projects/usecases', useCaseRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/projects/sprints', sprintRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects/tasks", taskRoutes);
app.use("/api/jira", jiraRoutes);

app.get("/jira/wiki/api/v2/spaces", async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const host = process.env.JIRA_HOST || "https://karnativanhitha.atlassian.net";
        const jiraUrl = `${host}/wiki/api/v2/spaces${query ? `?${query}` : ""}`;
        const headers = {};

        const email = process.env.JIRA_EMAIL || process.env.CONFLUENCE_EMAIL;
        const token = process.env.JIRA_API_TOKEN || process.env.CONFLUENCE_API_TOKEN;

        if (email && token) {
            const credentials = Buffer
                .from(`${email}:${token}`)
                .toString("base64");

            headers.Authorization = `Basic ${credentials}`;
        }

        const response = await fetch(jiraUrl, { headers });
        const body = await response.text();

        res.status(response.status);
        res.type(response.headers.get("content-type") || "application/json");
        res.send(body);
    } catch (error) {
        console.error("Error loading Confluence spaces:", error);
        res.status(502).json({ message: "Unable to load Confluence spaces" });
    }
});

app.get("/jira/rest/api/3/project/search", async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const host = process.env.JIRA_HOST || "https://karnativanhitha.atlassian.net";
        const jiraUrl = `${host}/rest/api/3/project/search${query ? `?${query}` : ""}`;
        const headers = {};

        const email = process.env.JIRA_EMAIL || process.env.CONFLUENCE_EMAIL;
        const token = process.env.JIRA_API_TOKEN || process.env.CONFLUENCE_API_TOKEN;

        if (email && token) {
            const credentials = Buffer
                .from(`${email}:${token}`)
                .toString("base64");

            headers.Authorization = `Basic ${credentials}`;
        }

        const response = await fetch(jiraUrl, { headers });
        const body = await response.text();

        res.status(response.status);
        res.type(response.headers.get("content-type") || "application/json");
        res.send(body);
    } catch (error) {
        console.error("Error loading Jira projects:", error);
        res.status(502).json({ message: "Unable to load Jira projects" });
    }
});

async function startServer() {

    try {

        await connectDB();

        // Run table initializations only after DB is connected
        await initProjectsTable();
        await initTaskTable();
        await initRoleTable();
        await initCalendarTables();
        await initTimesheetTable();
        await initUseCaseTable();
        await initSprintTable();

        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });

    }

    catch (err) {

        console.log(err);

    }

}

startServer();

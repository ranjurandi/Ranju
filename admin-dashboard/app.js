const configuredApi = document.querySelector('meta[name="api-base"]').content.trim();
console.log('Admin Dashboard app.js loaded');
const API = (configuredApi || "http://localhost:8000/api").replace(/\/+$/, "");
const TOKEN_KEY = "godavari_admin_token";
const STATUSES = ["Pending", "Reviewing", "Shortlisted", "Rejected", "Selected"];
const CONTACT_STATUSES = ["New", "Read", "Replied"];
const state = { jobs: [], profile: null };

const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const pageContent = document.getElementById("page-content");
const notice = document.getElementById("notice");
const loginError = document.getElementById("login-error");
const passwordInput = document.getElementById("admin-password");
const passwordToggle = document.getElementById("password-toggle");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function displayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleString();
}

function showNotice(message, isError = false) {
  notice.textContent = message;
  notice.classList.toggle("error", isError);
  notice.hidden = !message;
}

function showLogin(message = "") {
  loginView.hidden = false;
  dashboardView.hidden = true;
  loginError.textContent = message;
  loginError.hidden = !message;
  document.querySelector("#login-form [name='password']").value = "";
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  document.getElementById("admin-identity").textContent =
    state.profile?.name || state.profile?.username || "";
}

function formatApiError(response, data) {
  const detail = data?.detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((issue) => {
      if (typeof issue === "string") return issue;
      const location = Array.isArray(issue?.loc)
        ? issue.loc.filter((part) => part !== "body").join(".")
        : "";
      const message = typeof issue?.msg === "string" ? issue.msg : JSON.stringify(issue);
      return location ? `${location}: ${message}` : message;
    });
    return `Request failed (${response.status}): ${messages.join("; ")}`;
  }
  if (typeof detail === "string") {
    return `Request failed (${response.status}): ${detail}`;
  }
  if (detail !== undefined) {
    return `Request failed (${response.status}): ${JSON.stringify(detail)}`;
  }
  if (typeof data?.message === "string") {
    return `Request failed (${response.status}): ${data.message}`;
  }
  return `Request failed (${response.status}).`;
}

passwordToggle.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  passwordToggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  passwordToggle.setAttribute("aria-pressed", String(isHidden));
  passwordToggle.querySelector(".password-eye-open").hidden = isHidden;
  passwordToggle.querySelector(".password-eye-closed").hidden = !isHidden;
});

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = formatApiError(response, data);
    if (response.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      showLogin(`Your admin session has ended. ${message}`);
    }
    throw new Error(message);
  }
  return data;
}

function setPage(title, view) {
  document.getElementById("page-title").textContent = title;
  document.querySelectorAll(".side-nav [data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  showNotice("");
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

async function renderDashboard() {
  setPage("Dashboard", "dashboard");
  pageContent.innerHTML = '<p class="loading">Loading dashboard data...</p>';
  const data = await api("/admin/dashboard");
  const cards = [
    ["Registered users", data.registered_users === null ? "Not configured" : data.registered_users],
    ["Total contact queries", data.total_contact_queries],
    ["New / unread queries", data.new_contact_queries],
    ["Job requirements", data.total_job_requirements],
    ["Active job openings", data.active_job_openings],
    ["Career applications", data.total_career_applications],
    ["Pending applications", data.pending_applications],
  ];
  pageContent.innerHTML = `
    <div class="stats-grid">
      ${cards.map(([label, value]) => `
        <article class="stat-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </article>`).join("")}
    </div>
    <div class="panel" style="margin-top:20px">
      <p class="muted">Counts are read from the configured backend database. Registered users are shown only when the existing database has a <code>users</code> collection.</p>
    </div>`;
}

function jobForm(job = null) {
  const value = (key, fallback = "") => escapeHtml(job?.[key] ?? fallback);
  return `
    <form id="job-form" class="panel job-form">
      <h2>${job ? "Edit job requirement" : "Add job requirement"}</h2>
      <input type="hidden" name="id" value="${value("id")}" />
      <div class="form-grid">
        <label>Job title<input name="title" required minlength="2" maxlength="160" value="${value("title")}" /></label>
        <label>Department<input name="department" required minlength="2" maxlength="120" value="${value("department")}" /></label>
        <label>Location<input name="location" required minlength="2" maxlength="160" value="${value("location")}" /></label>
        <label>Employment type
          <select name="employment_type" required>
            ${["Full-time", "Internship", "Part-time"].map((type) =>
              `<option value="${type}" ${job?.employment_type === type ? "selected" : ""}>${type}</option>`).join("")}
          </select>
        </label>
        <label>Experience required<input name="experience" required maxlength="120" value="${value("experience")}" /></label>
        <label>Number of vacancies<input name="vacancies" type="number" required min="1" max="1000" value="${value("vacancies", "1")}" /></label>
        <label class="wide">Required skills (comma separated)<input name="skills" required value="${value("skills", []).replace(/,/g, ", ")}" /></label>
        <label class="wide">Job description<textarea name="description" rows="5" required minlength="10" maxlength="10000">${value("description")}</textarea></label>
      </div>
      <div class="checkbox-row">
        <input id="job-active" name="is_active" type="checkbox" ${job?.is_active ? "checked" : ""} />
        <label for="job-active">Publish this job on the public Career page</label>
      </div>
      <div class="actions">
        <button class="primary-button" type="submit">Save requirement</button>
        <button class="secondary-button" type="button" data-action="cancel-job-form">Cancel</button>
      </div>
    </form>`;
}

async function renderJobs() {
  setPage("Job Requirements", "jobs");
  pageContent.innerHTML = '<p class="loading">Loading job requirements...</p>';
  state.jobs = await api("/admin/jobs");
  pageContent.innerHTML = `
    <div class="section-heading">
      <h2>Job requirements</h2>
      <button class="primary-button" type="button" data-action="new-job">Add requirement</button>
    </div>
    <div id="job-form-slot"></div>
    ${state.jobs.length ? `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Title / Department</th><th>Location</th><th>Type</th><th>Vacancies</th><th>Published</th><th>Actions</th></tr></thead>
          <tbody>
            ${state.jobs.map((job) => `
              <tr>
                <td><strong>${escapeHtml(job.title)}</strong><br /><span class="muted">${escapeHtml(job.department)}</span></td>
                <td>${escapeHtml(job.location)}</td>
                <td>${escapeHtml(job.employment_type)}</td>
                <td>${escapeHtml(job.vacancies)}</td>
                <td>${job.is_active ? "Active" : "Unpublished"}</td>
                <td><div class="actions">
                  <button class="secondary-button" type="button" data-action="edit-job" data-id="${escapeHtml(job.id)}">Edit</button>
                  <button class="secondary-button" type="button" data-action="toggle-job" data-id="${escapeHtml(job.id)}">${job.is_active ? "Unpublish" : "Publish"}</button>
                  <button class="danger-button" type="button" data-action="delete-job" data-id="${escapeHtml(job.id)}">Delete</button>
                </div></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : emptyState("No job requirements have been created yet.")}`;
}

async function renderApplications() {
  setPage("Career Applications", "applications");
  pageContent.innerHTML = '<p class="loading">Loading applications...</p>';
  const applications = await api("/admin/applications");
  pageContent.innerHTML = `
    <div class="section-heading"><h2>Career applications (${applications.length})</h2></div>
    ${applications.length ? applications.map((application) => `
      <details class="record-card">
        <summary>${escapeHtml(application.full_name)} — ${escapeHtml(application.position)}
          <span>${escapeHtml(application.email)} · ${displayDate(application.created_at)}</span>
        </summary>
        <div class="record-details">
          <div><strong>Phone</strong>${escapeHtml(application.phone)}</div>
          <div><strong>Position</strong>${escapeHtml(application.position)}</div>
          <div><strong>Experience</strong>${escapeHtml(application.experience)}</div>
          <div><strong>Application date</strong>${displayDate(application.created_at)}</div>
          <div class="full-width"><strong>Skills</strong>${escapeHtml(application.skills)}</div>
          <div class="full-width"><strong>Additional message</strong>${escapeHtml(application.additional_message || "—")}</div>
          <div>
            <strong>Resume</strong>
            ${application.has_resume
              ? `<button class="secondary-button" type="button" data-action="download-resume" data-id="${escapeHtml(application.id)}">Download resume</button>`
              : "Not provided"}
          </div>
          <label><strong>Application status</strong>
            <select class="status-select" data-action="application-status" data-id="${escapeHtml(application.id)}">
              ${STATUSES.map((status) => `<option ${application.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
          </label>
        </div>
      </details>`).join("") : emptyState("No career applications have been submitted.")}`;
}

async function renderContacts() {
  setPage("Contact Queries", "contacts");
  pageContent.innerHTML = '<p class="loading">Loading contact queries...</p>';
  const queries = await api("/admin/contact-queries");
  pageContent.innerHTML = `
    <div class="section-heading"><h2>Contact queries (${queries.length})</h2></div>
    ${queries.length ? queries.map((query) => `
      <details class="record-card">
        <summary>${escapeHtml(query.name)} — ${escapeHtml(query.subject || "General inquiry")}
          <span>${escapeHtml(query.email)} · ${displayDate(query.created_at)}</span>
        </summary>
        <div class="record-details">
          <div><strong>Name</strong>${escapeHtml(query.name)}</div>
          <div><strong>Email</strong>${escapeHtml(query.email)}</div>
          <div><strong>Phone</strong>${escapeHtml(query.phone || "—")}</div>
          <div><strong>Company</strong>${escapeHtml(query.company || "—")}</div>
          <div><strong>Subject</strong>${escapeHtml(query.subject || "—")}</div>
          <div><strong>Submitted</strong>${displayDate(query.created_at)}</div>
          <div class="full-width"><strong>Message</strong>${escapeHtml(query.message || "—")}</div>
          <label><strong>Query status</strong>
            <select class="status-select" data-action="contact-status" data-id="${escapeHtml(query.id)}">
              ${CONTACT_STATUSES.map((status) => `<option ${query.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
          </label>
          <div><strong>Manage query</strong><button class="danger-button" type="button" data-action="delete-contact" data-id="${escapeHtml(query.id)}">Delete query</button></div>
        </div>
      </details>`).join("") : emptyState("No contact queries have been submitted.")}`;
}

async function renderProfile() {
  setPage("Admin Profile", "profile");
  pageContent.innerHTML = '<p class="loading">Loading profile...</p>';
  state.profile = await api("/admin/profile");
  showDashboard();
  pageContent.innerHTML = `
    <div class="panel">
      <h2>Administrator profile</h2>
      <div class="profile-grid" style="margin-top:18px">
        <div class="profile-item"><span>Name</span><strong>${escapeHtml(state.profile.name)}</strong></div>
        <div class="profile-item"><span>Username</span><strong>${escapeHtml(state.profile.username)}</strong></div>
        <div class="profile-item"><span>Role</span><strong>${escapeHtml(state.profile.role)}</strong></div>
      </div>
      <button class="danger-button" type="button" data-action="logout" style="margin-top:20px">Secure logout</button>
    </div>`;
}

async function loadView(view) {
  const renderers = {
    dashboard: renderDashboard,
    jobs: renderJobs,
    applications: renderApplications,
    contacts: renderContacts,
    profile: renderProfile,
  };
  try {
    await renderers[view]();
  } catch (error) {
    showNotice(error.message || "The requested data could not be loaded.", true);
    pageContent.innerHTML = emptyState("This section could not be loaded.");
  }
}

async function logout() {
  try {
    await api("/admin/logout", { method: "POST" });
  } catch (error) {
    showNotice(error.message || "The server session could not be cleared.", true);
  } finally {
    sessionStorage.removeItem(TOKEN_KEY);
    state.profile = null;
    showLogin();
  }
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  const form = new FormData(event.currentTarget);
  try {
    const result = await api("/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    sessionStorage.setItem(TOKEN_KEY, result.access_token);
    state.profile = await api("/admin/profile");
    showDashboard();
    await loadView("dashboard");
  } catch (error) {
    sessionStorage.removeItem(TOKEN_KEY);
    loginError.textContent = error.message || "Sign in failed.";
    loginError.hidden = false;
  }
});

document.querySelector(".side-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (button) loadView(button.dataset.view);
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === "logout") return logout();
  if (action === "new-job") {
    document.getElementById("job-form-slot").innerHTML = jobForm();
    document.getElementById("job-form-slot").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "cancel-job-form") {
    document.getElementById("job-form-slot").innerHTML = "";
    return;
  }
  if (action === "edit-job") {
    const job = state.jobs.find((item) => item.id === id);
    if (job) document.getElementById("job-form-slot").innerHTML = jobForm(job);
    return;
  }
  if (action === "delete-job") {
    if (!window.confirm("Delete this job requirement? Existing applications remain stored.")) return;
    try {
      await api(`/admin/jobs/${encodeURIComponent(id)}`, { method: "DELETE" });
      await renderJobs();
      showNotice("Job requirement deleted.");
    } catch (error) {
      showNotice(error.message, true);
    }
    return;
  }
  if (action === "toggle-job") {
    const job = state.jobs.find((item) => item.id === id);
    if (!job) return;
    try {
      await api(`/admin/jobs/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ ...job, is_active: !job.is_active }),
      });
      await renderJobs();
      showNotice(job.is_active ? "Job unpublished." : "Job published on the Career page.");
    } catch (error) {
      showNotice(error.message, true);
    }
    return;
  }
  if (action === "delete-contact") {
    if (!window.confirm("Delete this contact query? This cannot be undone.")) return;
    try {
      await api(`/admin/contact-queries/${encodeURIComponent(id)}`, { method: "DELETE" });
      await renderContacts();
      showNotice("Contact query deleted.");
    } catch (error) {
      showNotice(error.message, true);
    }
    return;
  }
  if (action === "download-resume") {
    try {
      const response = await fetch(
        `${API}/admin/applications/${encodeURIComponent(id)}/resume`,
        { headers: { Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` } },
      );
      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY);
          showLogin("Your admin session has ended. Please sign in again.");
        }
        throw new Error("Resume could not be downloaded.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `resume-${id}`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      showNotice(error.message, true);
    }
  }
});

document.addEventListener("change", async (event) => {
  const control = event.target;
  if (control.dataset.action !== "application-status" && control.dataset.action !== "contact-status") return;
  const path = control.dataset.action === "application-status"
    ? `/admin/applications/${encodeURIComponent(control.dataset.id)}/status`
    : `/admin/contact-queries/${encodeURIComponent(control.dataset.id)}/status`;
  try {
    await api(path, {
      method: "PATCH",
      body: JSON.stringify({ status: control.value }),
    });
    showNotice("Status updated.");
  } catch (error) {
    showNotice(error.message, true);
  }
});

document.addEventListener("submit", async (event) => {
  console.log('Submit handler triggered for', event.target.getAttribute('id'));

  if (event.target.getAttribute("id") !== "job-form") return;
  event.preventDefault();
  const form = event.target;
  const values = new FormData(form);
  const job = {
    title: values.get("title").trim(),
    department: values.get("department").trim(),
    location: values.get("location").trim(),
    employment_type: values.get("employment_type"),
    experience: values.get("experience").trim(),
    vacancies: Number(values.get("vacancies")),
    skills: values.get("skills").split(",").map((skill) => skill.trim()).filter(Boolean),
    description: values.get("description").trim(),
    is_active: form.elements.is_active.checked,
  };
  const id = values.get("id");
  try {
    await api(id ? `/admin/jobs/${encodeURIComponent(id)}` : "/admin/jobs", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(job),
    });
    await renderJobs();
    showNotice(id ? "Job requirement updated." : "Job requirement created.");
  } catch (error) {
    showNotice(error.message, true);
  }
});

async function restoreSession() {
  if (!sessionStorage.getItem(TOKEN_KEY)) return showLogin();
  try {
    state.profile = await api("/admin/profile");
    showDashboard();
    await loadView("dashboard");
  } catch (error) {
    if (sessionStorage.getItem(TOKEN_KEY)) {
      showLogin(error.message || "The admin service is unavailable.");
    }
  }
}

restoreSession();

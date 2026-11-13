import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BriefcaseBusiness, MapPin, Users } from "lucide-react";
import { PageHeader, Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/fx";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");
const API = `${API_BASE}/api`;
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  experience: "",
  skills: "",
  additional_message: "",
};

function JobCard({ job, onApply }) {
  return (
    <article className="glass-card card-hover h-full p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{job.department}</p>
          <h3 className="mt-3 font-display text-xl font-bold text-white sm:text-2xl">
            {job.title}
          </h3>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-200">
          {job.employment_type}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#00C8FF]" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-[#00C8FF]" />
          {job.experience}
        </span>
        <span className="inline-flex items-center gap-2">
          <Users className="h-4 w-4 text-[#00C8FF]" />
          {job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}
        </span>
      </div>
      <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-400">
        {job.description}
      </p>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Required skills
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onApply(job)}
        className="mt-7 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(8,123,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_38px_rgba(0,200,255,0.45)]"
      >
        Apply Now
      </button>
    </article>
  );
}

export default function Career() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [resume, setResume] = useState(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [applicationError, setApplicationError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setJobsError("");
    try {
      const { data } = await axios.get(`${API}/careers/jobs`, { timeout: 10000 });
      if (!Array.isArray(data)) {
        throw new Error("The Career API returned an invalid jobs response.");
      }
      setJobs(data);
    } catch (error) {
      setJobs([]);
      setJobsError(
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message === "The Career API returned an invalid jobs response."
            ? error.message
            : "Job openings could not be loaded. Check the backend API URL, CORS settings, and MongoDB connection, then retry.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Careers | Godavari Wave Technologies";
    loadJobs();
  }, [loadJobs]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const selectJob = (job) => {
    setSelectedJob(job);
    setSuccess("");
    setApplicationError("");
    setForm(EMPTY_FORM);
    setResume(null);
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!selectedJob || !resume) {
      setApplicationError("Choose a resume file before submitting your application.");
      return;
    }
    if (!/\.(pdf|doc|docx)$/i.test(resume.name)) {
      setApplicationError("Resume must be a PDF, DOC, or DOCX file.");
      return;
    }
    if (resume.size > MAX_RESUME_SIZE) {
      setApplicationError("Resume file must be 5 MB or smaller.");
      return;
    }

    setSending(true);
    setApplicationError("");
    try {
      // 1. Get presigned upload URL from backend
      const uploadResp = await axios.get(`${API}/careers/applications/upload-url`, {
        params: { filename: resume.name },
      });
      const { url, fields, key } = uploadResp.data;

      // 2. Upload file directly to S3
      const s3Form = new FormData();
      // Append all required fields returned by presigned POST
      Object.entries(fields).forEach(([k, v]) => s3Form.append(k, v));
      // The file must be appended with the field name 'file' or as specified by fields.key
      s3Form.append('file', resume);
      await axios.post(url, s3Form, { headers: { 'Content-Type': 'multipart/form-data' } });

      // 3. Submit application to backend with resume_key and resume_filename
      const application = new FormData();
      application.append("job_id", selectedJob.id);
      Object.entries(form).forEach(([key, value]) => application.append(key, value));
      application.append("resume_key", key);
      application.append("resume_filename", resume.name);
      await axios.post(`${API}/careers/applications`, application);

      setSuccess(`Your application for ${selectedJob.title} was submitted successfully.`);
      setSelectedJob(null);
      setForm(EMPTY_FORM);
      setResume(null);
    } catch (error) {
      const detail = error.response?.data?.detail;
      setApplicationError(
        typeof detail === "string"
          ? detail
          : "Your application could not be submitted. Please try again."
      );
    } finally {
      setSending(false);
    }
  }; {
    event.preventDefault();
    if (!selectedJob || !resume) {
      setApplicationError("Choose a resume file before submitting your application.");
      return;
    }
    if (!/\.(pdf|doc|docx)$/i.test(resume.name)) {
      setApplicationError("Resume must be a PDF, DOC, or DOCX file.");
      return;
    }
    if (resume.size > MAX_RESUME_SIZE) {
      setApplicationError("Resume file must be 5 MB or smaller.");
      return;
    }

    setSending(true);
    setApplicationError("");
    const application = new FormData();
    application.append("job_id", selectedJob.id);
    Object.entries(form).forEach(([key, value]) => application.append(key, value));
    application.append("resume", resume);
    try {
      await axios.post(`${API}/careers/applications`, application);
      setSuccess(`Your application for ${selectedJob.title} was submitted successfully.`);
      setSelectedJob(null);
      setForm(EMPTY_FORM);
      setResume(null);
    } catch (error) {
      const detail = error.response?.data?.detail;
      setApplicationError(
        typeof detail === "string"
          ? detail
          : "Your application could not be submitted. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        crumb="Home / Careers"
        title="Build your future"
        highlight="with us."
        eyebrow="Careers at Godavari Wave"
        desc="Join a team that turns ambitious ideas into useful digital products. Explore current opportunities and share your experience with us."
      />

      <section className="relative pb-20 sm:pb-28" data-testid="career-openings">
        <div className="container-gwt">
          <SectionHeading
            eyebrow="Current opportunities"
            title="Find your"
            highlight="next role"
            desc="These openings are published by our team and updated as positions become available."
          />

          {loading && <p className="mt-10 text-sm text-slate-400">Loading current openings...</p>}
          {!loading && jobsError && (
            <div role="alert" className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
              <p className="mb-0">{jobsError}</p>
              <button
                type="button"
                onClick={loadJobs}
                disabled={loading}
                className="rounded-full border border-red-300/30 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-300/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Retry
              </button>
            </div>
          )}
          {success && (
            <p role="status" className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
              {success}
            </p>
          )}
          {!loading && !jobsError && jobs.length === 0 && (
            <div className="glass-card mt-10 p-8 text-center">
              <p className="font-display text-lg font-semibold text-white">No current openings</p>
              <p className="mt-2 text-sm text-slate-400">Please check back soon for new opportunities.</p>
            </div>
          )}
          {!loading && !jobsError && jobs.length > 0 && (
            <Stagger className="mt-10 grid gap-6 lg:grid-cols-2">
              {jobs.map((job) => (
                <StaggerItem key={job.id} className="h-full">
                  <JobCard job={job} onApply={selectJob} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {selectedJob && (
        <section className="relative pb-20 sm:pb-28" data-testid="career-application-form">
          <div className="container-gwt">
            <Reveal>
              <form
                onSubmit={submitApplication}
                className="glass-card glass-glow mx-auto max-w-3xl p-6 sm:p-9"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Career application</p>
                    <h2 className="mt-3 font-display text-2xl font-bold text-white">
                      Apply for {selectedJob.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-slate-300">
                    Full Name
                    <input
                      name="full_name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={160}
                      value={form.full_name}
                      onChange={updateField}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-[#087BFF]/30"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    Email
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={320}
                      value={form.email}
                      onChange={updateField}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-[#087BFF]/30"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    Phone Number
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      minLength={7}
                      maxLength={40}
                      value={form.phone}
                      onChange={updateField}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-[#087BFF]/30"
                    />
                  </label>
                  <label className="text-sm text-slate-300">
                    Position Applied For
                    <input
                      value={selectedJob.title}
                      readOnly
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400 outline-none"
                    />
                  </label>
                  <label className="text-sm text-slate-300 sm:col-span-2">
                    Experience
                    <input
                      name="experience"
                      required
                      maxLength={120}
                      placeholder="e.g. 2 years, or Fresher"
                      value={form.experience}
                      onChange={updateField}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-[#087BFF]/30"
                    />
                  </label>
                  <label className="text-sm text-slate-300 sm:col-span-2">
                    Skills
                    <textarea
                      name="skills"
                      required
                      minLength={1}
                      maxLength={2000}
                      rows={3}
                      value={form.skills}
                      onChange={updateField}
                      className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-[#087BFF]/30"
                    />
                  </label>
                  <label className="text-sm text-slate-300 sm:col-span-2">
                    Resume (PDF, DOC, or DOCX; max 5 MB)
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      required
                      onChange={(event) => setResume(event.target.files?.[0] || null)}
                      className="mt-2 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#087BFF]/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cyan-200"
                    />
                  </label>
                  <label className="text-sm text-slate-300 sm:col-span-2">
                    Additional Message
                    <textarea
                      name="additional_message"
                      maxLength={5000}
                      rows={4}
                      value={form.additional_message}
                      onChange={updateField}
                      className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-[#087BFF]/30"
                    />
                  </label>
                </div>
                {applicationError && (
                  <p role="alert" className="mt-5 text-sm text-red-300">{applicationError}</p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-7 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
